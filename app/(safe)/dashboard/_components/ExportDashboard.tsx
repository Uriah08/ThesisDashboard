import ExcelJS from "exceljs"
import { saveAs } from "file-saver"
import { format } from "date-fns"
import { ProductionFarmProductionModel, FarmsFarmModel } from "@/lib/types"
import { type DateRange } from "react-day-picker"

function buildRows(
  recentFarms: FarmsFarmModel[] = [],
  recentProduction: ProductionFarmProductionModel[] = [],
) {
  const byFarm: Record<string, { totalKg: number; satisfactionSum: number; count: number }> = {}

  for (const p of recentProduction) {
    const farmName = p.farms_farmmodel?.name
    if (!farmName) continue
    if (!byFarm[farmName]) byFarm[farmName] = { totalKg: 0, satisfactionSum: 0, count: 0 }
    byFarm[farmName].totalKg += p.quantity ?? 0
    byFarm[farmName].satisfactionSum += p.satisfaction ?? 0
    byFarm[farmName].count += 1
  }

  return recentFarms.map((farm) => {
    const agg = byFarm[farm.name] ?? { totalKg: 0, satisfactionSum: 0, count: 0 }
    return {
      farmName: farm.name,
      owner: `${farm.users_customuser?.first_name} ${farm.users_customuser?.last_name}` || "",
      totalKg: parseFloat(agg.totalKg.toFixed(2)),
      avgSatisfaction: agg.count > 0 ? parseFloat((agg.satisfactionSum / agg.count).toFixed(2)) : 0,
    }
  })
}

const BLUE    = "FF155183"
const WHITE   = "FFFFFFFF"
const LIGHT   = "FFE8F0F8"
const BORDER  = "FFD0DDE9"
const DARK    = "FF0D2E47"
const SUBTEXT = "FF6B8FAD"

function applyHeaderStyle(cell: ExcelJS.Cell, size = 10) {
  cell.font      = { name: "Arial", bold: true, color: { argb: BLUE }, size }
  cell.fill      = { type: "pattern", pattern: "solid", fgColor: { argb: LIGHT } }
  cell.alignment = { horizontal: "center", vertical: "middle" }
  cell.border    = {
    top:    { style: "thin", color: { argb: BORDER } },
    bottom: { style: "thin", color: { argb: BORDER } },
    left:   { style: "thin", color: { argb: BORDER } },
    right:  { style: "thin", color: { argb: BORDER } },
  }
}

function applyDataStyle(cell: ExcelJS.Cell, rowIndex: number, isNumber = false) {
  cell.font      = { name: "Arial", size: 10, color: { argb: DARK } }
  cell.fill      = { type: "pattern", pattern: "solid", fgColor: { argb: rowIndex % 2 === 0 ? "FFF7FAFD" : WHITE } }
  cell.alignment = { horizontal: isNumber ? "center" : "left", vertical: "middle" }
  cell.border    = {
    bottom: { style: "hair", color: { argb: BORDER } },
    left:   { style: "hair", color: { argb: BORDER } },
    right:  { style: "hair", color: { argb: BORDER } },
  }
}

export async function exportDashboardToExcel(
  recentFarms: FarmsFarmModel[] = [],
  recentProduction: ProductionFarmProductionModel[] = [],
  appliedRange?: DateRange,
) {
  const wb = new ExcelJS.Workbook()
  wb.creator = "Naic Fish Dashboard"
  wb.created = new Date()

  const ws = wb.addWorksheet("Farm Production", {
    pageSetup: { paperSize: 9, orientation: "landscape", fitToPage: true },
  })

  // A = left logo, B = spacer, C–F = content, G = spacer, H = right logo
  ws.columns = [
    { key: "logoL",  width: 10 },
    { key: "spacerL", width: 2 },
    { key: "farm",   width: 30 },
    { key: "owner",  width: 22 },
    { key: "kg",     width: 22 },
    { key: "sat",    width: 26 },
    { key: "spacerR", width: 2 },
    { key: "logoR",  width: 10 },
  ]

  const COLS       = 8
  const HEADER_ROWS = 5
  // Row heights: rows 1&2 are tall logo rows, 3=municipality, 4=report name, 5=date
  const rowHeights: Record<number, number> = { 1: 36, 2: 36, 3: 26, 4: 18, 5: 16 }

  for (let r = 1; r <= HEADER_ROWS; r++) {
    const row = ws.getRow(r)
    row.height = rowHeights[r]
    for (let c = 1; c <= COLS; c++) {
      ws.getRow(r).getCell(c).fill = { type: "pattern", pattern: "solid", fgColor: { argb: BLUE } }
    }
  }

  // Merge content columns C–F (cols 3–6) for all header rows
  for (let r = 1; r <= HEADER_ROWS; r++) {
    ws.mergeCells(r, 3, r, 6)
  }

  // Republic of the Philippines
  const r1 = ws.getCell("C1")
  r1.value     = "Republic of the Philippines"
  r1.font      = { name: "Arial", size: 8, italic: true, color: { argb: "FFAACCE8" } }
  r1.alignment = { horizontal: "center", vertical: "bottom" }

  // Province of Cavite
  const r2 = ws.getCell("C2")
  r2.value     = "Province of Cavite"
  r2.font      = { name: "Arial", size: 8, italic: true, color: { argb: "FFAACCE8" } }
  r2.alignment = { horizontal: "center", vertical: "top" }

  // Municipality of Naic
  const r3 = ws.getCell("C3")
  r3.value     = "Municipality of Naic"
  r3.font      = { name: "Arial", bold: true, size: 15, color: { argb: WHITE } }
  r3.alignment = { horizontal: "center", vertical: "middle" }

  // Report name
  const r4 = ws.getCell("C4")
  r4.value     = "Sundried Fish Production Report"
  r4.font      = { name: "Arial", bold: true, size: 10, color: { argb: "FFD6E8F7" } }
  r4.alignment = { horizontal: "center", vertical: "middle" }

  // Date range
  const dateLabel = appliedRange?.from && appliedRange?.to
    ? `${format(appliedRange.from, "MMMM d, yyyy")}  –  ${format(appliedRange.to, "MMMM d, yyyy")}`
    : "All Time"
  const r5 = ws.getCell("C5")
  r5.value     = `Period: ${dateLabel}`
  r5.font      = { name: "Arial", size: 8, italic: true, color: { argb: "FF8AB8D8" } }
  r5.alignment = { horizontal: "center", vertical: "middle" }

  // ── Logos — small and square, vertically centered in the 2-row logo area ──

  // Logo occupies cols 0–1 (col A) and rows 0–4, but we shrink it to stay square
  // tl/br use 0-based col/row fractional units

  // ── Spacer row ────────────────────────────────────────────────────────────
  const spacerRow = ws.getRow(6)
  spacerRow.height = 5
  for (let c = 1; c <= COLS; c++) {
    spacerRow.getCell(c).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFDCE8F2" } }
  }

  // ── Column header row ─────────────────────────────────────────────────────
  const colHeaderRow = ws.getRow(7)
  colHeaderRow.height = 22
  const headers = ["", "", "Farm Name", "Owner / Operator", "Total Production (kg)", "Avg. Satisfaction (1–5)", "", ""]
  headers.forEach((h, i) => {
    const cell = colHeaderRow.getCell(i + 1)
    cell.value = h
    if (h) {
      applyHeaderStyle(cell)
    } else {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: LIGHT } }
    }
  })

  // ── Data rows ─────────────────────────────────────────────────────────────
  const rows = buildRows(recentFarms, recentProduction)

  rows.forEach((r, i) => {
    const row = ws.addRow(["", "", r.farmName, r.owner, r.totalKg, r.avgSatisfaction, "", ""])
    row.height = 18
    row.eachCell((cell, colNum) => {
      if (colNum === 1 || colNum === 2 || colNum === 7 || colNum === 8) {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: i % 2 === 0 ? "FFF7FAFD" : WHITE } }
        return
      }
      applyDataStyle(cell, i, colNum >= 5)
    })
  })

  // ── Footer ────────────────────────────────────────────────────────────────
  ws.addRow([])
  const footerRow = ws.addRow(["", "", `Generated on ${format(new Date(), "MMMM d, yyyy 'at' h:mm a")}`, "", "", "", "", ""])
  footerRow.getCell(3).font      = { name: "Arial", size: 8, italic: true, color: { argb: SUBTEXT } }
  footerRow.getCell(3).alignment = { horizontal: "left" }

  // ── Export ────────────────────────────────────────────────────────────────
  const buffer = await wb.xlsx.writeBuffer()
  const blob   = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
  const filename = appliedRange?.from && appliedRange?.to
    ? `naic-sundried-fish_${format(appliedRange.from, "yyyy-MM-dd")}_to_${format(appliedRange.to, "yyyy-MM-dd")}.xlsx`
    : "naic-sundried-fish_all-time.xlsx"

  saveAs(blob, filename)
}