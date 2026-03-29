"use client"

import { useState } from "react"
import { ChevronDown, Check, MapPin, Package } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useCreateProductionMutation } from "@/store/productionApi"

// ── Types ─────────────────────────────────────────────────────────────────────

interface CreateProductionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  farms: string
}

interface FormData {
  title: string
  notes: string
  quantity: string
  total: string
  landing: string
  satisfaction: string
}

type FormErrors = Partial<FormData>

const SATISFACTION_OPTIONS = [
  { value: "1", label: "😞  Very Unsatisfied" },
  { value: "2", label: "😐  Unsatisfied" },
  { value: "3", label: "🙂  Neutral" },
  { value: "4", label: "😊  Satisfied" },
  { value: "5", label: "😁  Very Satisfied" },
]

const INITIAL: FormData = {
  title: "",
  notes: "",
  quantity: "",
  total: "",
  landing: "",
  satisfaction: "",
}

// ── Sub-components ────────────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[11px] font-semibold tracking-widest uppercase text-[#9ab0c4] mb-1.5">
      {children}
    </label>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-[10px] text-red-500 mt-1">{message}</p>
}

function TextInput({
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) {
  return (
    <input
      {...props}
      className={`w-full px-2.75 py-2 text-[13px] rounded-lg border-[1.5px] bg-white text-[#0d2e47] outline-none transition-colors focus:border-[#155183] placeholder:text-[#9ab0c4] ${
        error ? "border-red-400" : "border-[#e2eaf2]"
      }`}
    />
  )
}

function TextArea({
  error,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: boolean }) {
  return (
    <textarea
      {...props}
      rows={3}
      className={`w-full px-2.75 py-2 text-[13px] rounded-lg border-[1.5px] bg-white text-[#0d2e47] outline-none transition-colors focus:border-[#155183] placeholder:text-[#9ab0c4] resize-none ${
        error ? "border-red-400" : "border-[#e2eaf2]"
      }`}
    />
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function CreateProductionDialog({
  open,
  onOpenChange,
  onSuccess,
  farms,
}: CreateProductionDialogProps) {
  const [form, setForm] = useState<FormData>(INITIAL)
  const [errors, setErrors] = useState<FormErrors>({})


  const { mutateAsync, isPending } = useCreateProductionMutation()

  function set(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: "" }))
  }

  function validate(): boolean {
    const e: FormErrors = {}
    if (!form.title.trim())         e.title        = "Required"
    if (!form.quantity.trim())      e.quantity     = "Required"
    else if (isNaN(Number(form.quantity)) || Number(form.quantity) <= 0)
                                    e.quantity     = "Must be a positive number"
    if (!form.total.trim())         e.total        = "Required"
    else if (isNaN(Number(form.total)) || Number(form.total) < 0)
                                    e.total        = "Must be a valid amount"
    if (!form.satisfaction)         e.satisfaction = "Required"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit() {
    if (!validate()) return
    try {
      await mutateAsync({
        farm_id:      farms,
        title:        form.title,
        notes:        form.notes || null,
        quantity:     Number(form.quantity),
        total:        Number(form.total),
        landing:      form.landing || null,
        satisfaction: Number(form.satisfaction)
      })
      setForm(INITIAL)
      onOpenChange(false)
      onSuccess?.()
    } catch (err: unknown) {
      const error = err as { errors?: Record<string, string> }
      if (error?.errors) setErrors(error.errors)
    }
  }

  const selectedSatisfaction = SATISFACTION_OPTIONS.find((s) => s.value === form.satisfaction)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 overflow-hidden gap-0 max-w-120 rounded-2xl border-none [&>button]:hidden">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="bg-linear-to-br from-[#e8f0f8] to-[#c8ddf0] px-6 pt-5.5 pb-4.5 shrink-0">
          <DialogHeader className="space-y-0">
            <p className="text-[10px] font-semibold tracking-[0.08em] uppercase text-[#155183] opacity-60 mb-1">
              Production
            </p>
            <DialogTitle className="text-[17px] font-bold text-[#0d2e47] tracking-tight m-0 flex items-center gap-2">
              <Package size={16} color="#155183" />
              Add Production Record
            </DialogTitle>
          </DialogHeader>
        </div>

        {/* ── Body ───────────────────────────────────────────────────────── */}
        <div className="px-6 py-5 flex flex-col gap-3.5 max-h-105 overflow-y-auto">

          {/* Title */}
          <div>
            <FieldLabel>Title</FieldLabel>
            <TextInput
              type="text"
              placeholder="e.g. Batch #12 — Dried Bangus"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              error={!!errors.title}
            />
            <FieldError message={errors.title} />
          </div>

          {/* Quantity + Total */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>Quantity (kg)</FieldLabel>
              <TextInput
                type="number"
                min="0"
                step="0.1"
                placeholder="0.0"
                value={form.quantity}
                onChange={(e) => set("quantity", e.target.value)}
                error={!!errors.quantity}
              />
              <FieldError message={errors.quantity} />
            </div>
            <div>
              <FieldLabel>Total Sales (₱)</FieldLabel>
              <TextInput
                type="number"
                min="0"
                placeholder="0"
                value={form.total}
                onChange={(e) => set("total", e.target.value)}
                error={!!errors.total}
              />
              <FieldError message={errors.total} />
            </div>
          </div>

          {/* Satisfaction */}
          <div>
            <FieldLabel>Satisfaction</FieldLabel>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={`w-full flex items-center justify-between px-2.75 py-2 text-[13px] rounded-lg border-[1.5px] bg-white outline-none transition-colors ${
                    errors.satisfaction
                      ? "border-red-400"
                      : "border-[#e2eaf2] hover:border-[#155183]"
                  } ${selectedSatisfaction ? "text-[#0d2e47]" : "text-[#9ab0c4]"}`}
                >
                  <span>{selectedSatisfaction?.label ?? "Rate satisfaction"}</span>
                  <ChevronDown size={13} className="text-[#9ab0c4] shrink-0" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] rounded-lg border-[1.5px] border-[#e2eaf2] shadow-sm p-1"
                align="start"
              >
                {SATISFACTION_OPTIONS.map((s) => (
                  <DropdownMenuItem
                    key={s.value}
                    onSelect={() => set("satisfaction", s.value)}
                    className="flex items-center justify-between text-[13px] text-[#0d2e47] rounded-md px-3 py-2 cursor-pointer focus:bg-[#e8f0f8] focus:text-[#155183]"
                  >
                    <span>{s.label}</span>
                    {form.satisfaction === s.value && <Check size={12} className="text-[#155183]" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <FieldError message={errors.satisfaction} />
          </div>

          {/* Landing + Date */}
            <div>
              <FieldLabel>Landing site</FieldLabel>
              <div className="relative">
                <MapPin size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9ab0c4] pointer-events-none" />
                <TextInput
                  type="text"
                  placeholder="e.g. Naic Port"
                  value={form.landing}
                  onChange={(e) => set("landing", e.target.value)}
                  style={{ paddingLeft: 26 }}
                />
              </div>
            </div>

          {/* Notes */}
          <div>
            <FieldLabel>Notes (optional)</FieldLabel>
            <TextArea
              placeholder="Any additional notes about this batch…"
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
            />
          </div>
        </div>

        {/* ── Divider ────────────────────────────────────────────────────── */}
        <div className="h-px bg-[#f0f4f8] shrink-0" />

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <div className="px-6 py-3.5 flex items-center justify-between bg-[#fafbfc] shrink-0">
          <p className="text-[11px] text-[#9ab0c4]">* Farm, title, quantity, total and satisfaction are required</p>
          <div className="flex gap-2">
            <button
              onClick={() => { onOpenChange(false); setForm(INITIAL) }}
              className="text-[12px] font-semibold px-4 py-2 rounded-lg border-[1.5px] border-[#e2eaf2] bg-white text-[#9ab0c4] cursor-pointer hover:border-[#c5d5e4] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isPending}
              className={`text-[12px] font-semibold px-4 py-2 rounded-lg border-none text-white tracking-wide transition-colors ${
                isPending
                  ? "bg-[#9ab0c4] cursor-not-allowed"
                  : "bg-[#155183] hover:bg-[#0d3d6b] cursor-pointer"
              }`}
            >
              {isPending ? "Saving…" : "Add Record"}
            </button>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  )
}