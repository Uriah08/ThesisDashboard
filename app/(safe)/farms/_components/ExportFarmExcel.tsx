import ExcelJS from "exceljs"
import { saveAs } from "file-saver"
import { format } from "date-fns"
import { type DateRange } from "react-day-picker"

// ── Types (inline — adjust to match your actual types) ────────────────────────
interface Production {
  id: string
  title: string
  notes?: string
  satisfaction: number
  quantity: number
  total: number
  landing?: string
  created_at: string
}

interface Tray {
  id: string
  name: string
  description?: string
  status: string
  created_at: string
}

interface FarmExportData {
  name: string
  description?: string
  users_customuser?: { username: string; email: string }
  create_at: string
  production: Production[]
  trays: Tray[]
  totalProductionKg: number
  avgSatisfaction: number
  memberCount: number
}

// ── Constants ─────────────────────────────────────────────────────────────────
const BLUE    = "FF155183"
const WHITE   = "FFFFFFFF"
const LIGHT   = "FFE8F0F8"
const BORDER  = "FFD0DDE9"
const DARK    = "FF0D2E47"
const SUBTEXT = "FF6B8FAD"
const GREEN   = "FF15803D"
const GREEN_BG = "FFDCFCE7"
const GRAY_BG  = "FFF0F4F8"
const GRAY_FG  = "FF9AB0C4"

const SATISFACTION_LABELS: Record<number, string> = {
  1: "😞 Poor",
  2: "😐 Fair",
  3: "🙂 Good",
  4: "😊 Great",
  5: "😁 Excellent",
}

// ── Style helpers ─────────────────────────────────────────────────────────────
function headerStyle(cell: ExcelJS.Cell, size = 10) {
  cell.font      = { name: "Arial", bold: true, color: { argb: BLUE }, size }
  cell.fill      = { type: "pattern", pattern: "solid", fgColor: { argb: LIGHT } }
  cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true }
  cell.border    = {
    top:    { style: "thin",  color: { argb: BORDER } },
    bottom: { style: "thin",  color: { argb: BORDER } },
    left:   { style: "thin",  color: { argb: BORDER } },
    right:  { style: "thin",  color: { argb: BORDER } },
  }
}

function dataStyle(cell: ExcelJS.Cell, rowIdx: number, align: "left" | "center" | "right" = "left") {
  cell.font      = { name: "Arial", size: 10, color: { argb: DARK } }
  cell.fill      = { type: "pattern", pattern: "solid", fgColor: { argb: rowIdx % 2 === 0 ? "FFF7FAFD" : WHITE } }
  cell.alignment = { horizontal: align, vertical: "middle", wrapText: true }
  cell.border    = {
    bottom: { style: "hair", color: { argb: BORDER } },
    left:   { style: "hair", color: { argb: BORDER } },
    right:  { style: "hair", color: { argb: BORDER } },
  }
}

function summaryStyle(cell: ExcelJS.Cell, align: "left" | "center" | "right" = "left") {
  cell.font      = { name: "Arial", bold: true, size: 10, color: { argb: BLUE } }
  cell.fill      = { type: "pattern", pattern: "solid", fgColor: { argb: LIGHT } }
  cell.alignment = { horizontal: align, vertical: "middle" }
  cell.border    = {
    top:    { style: "thin", color: { argb: BORDER } },
    bottom: { style: "thin", color: { argb: BORDER } },
    left:   { style: "hair", color: { argb: BORDER } },
    right:  { style: "hair", color: { argb: BORDER } },
  }
}

// ── Shared: write the blue government header (rows 1–5) ───────────────────────
function writeGovHeader(ws: ExcelJS.Worksheet, totalCols: number, farmName: string, appliedRange?: DateRange) {
  const HEADER_ROWS = 5
  const rowHeights: Record<number, number> = { 1: 36, 2: 36, 3: 26, 4: 18, 5: 16 }

  for (let r = 1; r <= HEADER_ROWS; r++) {
    const row = ws.getRow(r)
    row.height = rowHeights[r]
    for (let c = 1; c <= totalCols; c++) {
      row.getCell(c).fill = { type: "pattern", pattern: "solid", fgColor: { argb: BLUE } }
    }
  }

  // Merge content columns (skip first spacer col + last spacer col)
  for (let r = 1; r <= HEADER_ROWS; r++) {
    ws.mergeCells(r, 2, r, totalCols - 1)
  }

  const r1 = ws.getCell("B1")
  r1.value     = "Republic of the Philippines"
  r1.font      = { name: "Arial", size: 8, italic: true, color: { argb: "FFAACCE8" } }
  r1.alignment = { horizontal: "center", vertical: "bottom" }

  const r2 = ws.getCell("B2")
  r2.value     = "Province of Cavite  ·  Municipality of Naic"
  r2.font      = { name: "Arial", bold: true, size: 15, color: { argb: WHITE } }
  r2.alignment = { horizontal: "center", vertical: "middle" }

  const r3 = ws.getCell("B3")
  r3.value     = `Sundried Fish Production Report — ${farmName}`
  r3.font      = { name: "Arial", bold: true, size: 10, color: { argb: "FFD6E8F7" } }
  r3.alignment = { horizontal: "center", vertical: "middle" }

  const r4 = ws.getCell("B4")
  r4.value     = "Municipality of Naic"
  r4.font      = { name: "Arial", size: 8, italic: true, color: { argb: "FFAACCE8" } }
  r4.alignment = { horizontal: "center", vertical: "top" }

  const dateLabel = appliedRange?.from && appliedRange?.to
    ? `${format(appliedRange.from, "MMMM d, yyyy")}  –  ${format(appliedRange.to, "MMMM d, yyyy")}`
    : "All Time"
  const r5 = ws.getCell("B5")
  r5.value     = `Period: ${dateLabel}`
  r5.font      = { name: "Arial", size: 8, italic: true, color: { argb: "FF8AB8D8" } }
  r5.alignment = { horizontal: "center", vertical: "middle" }

  // Spacer row 6
  const spacerRow = ws.getRow(6)
  spacerRow.height = 5
  for (let c = 1; c <= totalCols; c++) {
    spacerRow.getCell(c).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFDCE8F2" } }
  }
}

// ── Sheet 1: Production ───────────────────────────────────────────────────────
function buildProductionSheet(wb: ExcelJS.Workbook, farm: FarmExportData, appliedRange?: DateRange) {
  const ws = wb.addWorksheet("Production", {
    pageSetup: { paperSize: 9, orientation: "landscape", fitToPage: true },
  })

  ws.columns = [
    { key: "sL",    width: 2  },
    { key: "date",  width: 16 },
    { key: "title", width: 28 },
    { key: "land",  width: 20 },
    { key: "qty",   width: 18 },
    { key: "total", width: 18 },
    { key: "sat",   width: 20 },
    { key: "notes", width: 32 },
    { key: "sR",    width: 2  },
  ]

  const COLS = 9  // ← was 8, now matches the 9 actual columns
  writeGovHeader(ws, COLS, farm.name, appliedRange)

  // Column headers
  const colHdr = ws.getRow(7)
  colHdr.height = 22
  const headers = ["", "Date", "Production Title", "Landing Site", "Quantity (kg)", "Total Sales (₱)", "Satisfaction", "Notes", ""]
  const aligns: ("left" | "center" | "right")[] = ["left", "center", "left", "left", "center", "center", "center", "left", "left"]
  headers.forEach((h, i) => {
    const cell = colHdr.getCell(i + 1)
    cell.value = h
    if (h) {
      headerStyle(cell)
      cell.alignment = { horizontal: aligns[i], vertical: "middle" }
    } else {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: LIGHT } }
    }
  })

  // Data rows
  const production = farm.production
  if (production.length === 0) {
    const empty = ws.addRow(["", "No production records for this period", "", "", "", "", "", "", ""])
    empty.height = 18
    ws.mergeCells(empty.number, 2, empty.number, 8)
    const c = empty.getCell(2)
    c.font = { name: "Arial", size: 10, italic: true, color: { argb: SUBTEXT } }
    c.alignment = { horizontal: "center", vertical: "middle" }
  } else {
    production.forEach((p, i) => {
      const row = ws.addRow([
        "",
        format(new Date(p.created_at), "MMM d, yyyy"),
        p.title,
        p.landing ?? "—",
        parseFloat(Number(p.quantity).toFixed(2)),
        parseFloat(Number(p.total).toFixed(2)),
        SATISFACTION_LABELS[Math.max(1, Math.min(5, p.satisfaction))] ?? `${p.satisfaction}/5`,
        p.notes ?? "—",
        "",
      ])
      row.height = 18
      row.eachCell((cell, colNum) => {
        if ([1, 9].includes(colNum)) {  // ← was [1, 8]
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: i % 2 === 0 ? "FFF7FAFD" : WHITE } }
          return
        }
        const alignMap: Record<number, "left" | "center" | "right"> = {
          2: "center", 3: "left", 4: "left", 5: "center", 6: "center", 7: "center", 8: "left",
        }
        dataStyle(cell, i, alignMap[colNum] ?? "left")

        // Colour satisfaction cell (now col 7)
        if (colNum === 7) {
          const sat = p.satisfaction
          cell.font = { name: "Arial", size: 10, bold: true, color: { argb: sat >= 4 ? GREEN : sat === 3 ? "FF92400E" : "FFB91C1C" } }
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: sat >= 4 ? GREEN_BG : sat === 3 ? "FFFEF3C7" : "FFFEE2E2" } }
        }
      })
    })
  }

  // Summary row
  ws.addRow([])
  const totalKg    = production.reduce((s, p) => s + Number(p.quantity), 0)
  const totalSales = production.reduce((s, p) => s + Number(p.total), 0)
  const avgSat     = production.length > 0
    ? production.reduce((s, p) => s + p.satisfaction, 0) / production.length
    : 0

  const sumRow = ws.addRow([
    "", "TOTAL / AVG", "", "",
    parseFloat(totalKg.toFixed(2)),
    parseFloat(totalSales.toFixed(2)),
    parseFloat(avgSat.toFixed(2)),
    `${production.length} record(s)`,
    "",
  ])
  sumRow.height = 20
  sumRow.eachCell((cell, colNum) => {
    if ([1, 9].includes(colNum)) return  // ← was [1, 8]
    summaryStyle(cell, [5, 6, 7].includes(colNum) ? "center" : "left")
  })

  // Footer
  ws.addRow([])
  const foot = ws.addRow(["", `Generated on ${format(new Date(), "MMMM d, yyyy 'at' h:mm a")}`, "", "", "", "", "", "", ""])
  foot.getCell(2).font      = { name: "Arial", size: 8, italic: true, color: { argb: SUBTEXT } }
  foot.getCell(2).alignment = { horizontal: "left" }
}

// ── Sheet 2: Trays ────────────────────────────────────────────────────────────
function buildTraysSheet(wb: ExcelJS.Workbook, farm: FarmExportData, appliedRange?: DateRange) {
  const ws = wb.addWorksheet("Trays", {
    pageSetup: { paperSize: 9, orientation: "portrait", fitToPage: true },
  })

  ws.columns = [
    { key: "sL",     width: 2  },
    { key: "name",   width: 28 },
    { key: "desc",   width: 36 },
    { key: "status", width: 16 },
    { key: "date",   width: 18 },
    { key: "sR",     width: 2  },
  ]

  const COLS = 6
  writeGovHeader(ws, COLS, farm.name, appliedRange)

  const colHdr = ws.getRow(7)
  colHdr.height = 22
  const headers = ["", "Tray Name", "Description", "Status", "Created", ""]
  headers.forEach((h, i) => {
    const cell = colHdr.getCell(i + 1)
    cell.value = h
    if (h) {
      headerStyle(cell)
    } else {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: LIGHT } }
    }
  })

  const trays = farm.trays
  if (trays.length === 0) {
    const empty = ws.addRow(["", "No trays for this period", "", "", "", ""])
    empty.height = 18
    ws.mergeCells(empty.number, 2, empty.number, 5)
    const c = empty.getCell(2)
    c.font = { name: "Arial", size: 10, italic: true, color: { argb: SUBTEXT } }
    c.alignment = { horizontal: "center", vertical: "middle" }
  } else {
    trays.forEach((t, i) => {
      const row = ws.addRow([
        "",
        t.name,
        t.description ?? "—",
        t.status,
        format(new Date(t.created_at), "MMM d, yyyy"),
        "",
      ])
      row.height = 18
      row.eachCell((cell, colNum) => {
        if ([1, 6].includes(colNum)) {
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: i % 2 === 0 ? "FFF7FAFD" : WHITE } }
          return
        }
        dataStyle(cell, i, colNum === 4 ? "center" : "left")

        // Colour status badge
        if (colNum === 4) {
          const active = t.status === "active"
          cell.font = { name: "Arial", size: 10, bold: true, color: { argb: active ? GREEN : GRAY_FG } }
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: active ? GREEN_BG : GRAY_BG } }
          cell.alignment = { horizontal: "center", vertical: "middle" }
        }
      })
    })
  }

  // Summary
  ws.addRow([])
  const sumRow = ws.addRow([
    "", "TOTAL TRAYS", "",
    `${trays.filter(t => t.status === "active").length} active`,
    `${trays.length} total`, "",
  ])
  sumRow.height = 20
  sumRow.eachCell((cell, colNum) => {
    if ([1, 6].includes(colNum)) return
    summaryStyle(cell, colNum >= 4 ? "center" : "left")
  })

  ws.addRow([])
  const foot = ws.addRow(["", `Generated on ${format(new Date(), "MMMM d, yyyy 'at' h:mm a")}`, "", "", "", ""])
  foot.getCell(2).font      = { name: "Arial", size: 8, italic: true, color: { argb: SUBTEXT } }
  foot.getCell(2).alignment = { horizontal: "left" }
}

// ── Main export function ──────────────────────────────────────────────────────
export async function exportFarmToExcel(farm: FarmExportData, appliedRange?: DateRange) {
  const wb = new ExcelJS.Workbook()
  wb.creator = "Naic Fish Dashboard"
  wb.created = new Date()

  buildProductionSheet(wb, farm, appliedRange)
  buildTraysSheet(wb, farm, appliedRange)

  const buffer   = await wb.xlsx.writeBuffer()
  const blob     = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
  const safeName = farm.name.toLowerCase().replace(/\s+/g, "-")
  const filename = appliedRange?.from && appliedRange?.to
    ? `${safeName}_${format(appliedRange.from, "yyyy-MM-dd")}_to_${format(appliedRange.to, "yyyy-MM-dd")}.xlsx`
    : `${safeName}_all-time.xlsx`

  saveAs(blob, filename)
}