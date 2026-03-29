"use client"

import { useState } from "react"
import { useCreateFarm } from "@/store/farmApi"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Check, ChevronDown } from "lucide-react"
import { User, useUsersQuery } from "@/store/usersApi"

// ── Types ─────────────────────────────────────────────────────────────────────
interface CreateFarmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

interface FormData {
  name: string
  description: string
  password: string
  confirmPassword: string
  owner_id: string
}

type FormErrors = Partial<FormData>

const INITIAL: FormData = {
  name: "",
  description: "",
  password: "",
  confirmPassword: "",
  owner_id: "",
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
      className={`w-full px-2.75 py-2 text-[13px] rounded-lg border-[1.5px] outline-none transition-colors focus:border-[#155183] ${
        error ? "border-red-400" : "border-[#e2eaf2]"
      }`}
    />
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function CreateFarmDialog({ open, onOpenChange, onSuccess }: CreateFarmDialogProps) {
  const [form, setForm] = useState<FormData>(INITIAL)
  const [errors, setErrors] = useState<FormErrors>({})
  const { mutateAsync, isPending } = useCreateFarm()

  const { data: users = [], isLoading } = useUsersQuery()
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  function set(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: "" }))
  }

  function validate(): boolean {
    const e: FormErrors = {}
    if (!form.name.trim()) e.name = "Required"
    if (!form.description.trim()) e.description = "Required"
    if (!form.password.trim()) e.password = "Required"
    if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match"
    if (!form.owner_id.trim()) e.owner_id = "Please select an owner"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit() {
    if (!validate()) return

    try {
      await mutateAsync({
        name: form.name,
        description: form.description,
        password: form.password,
        confirmPassword: form.confirmPassword,
        owner_id: form.owner_id,
      })
      setForm(INITIAL)
      onOpenChange(false)
      onSuccess?.()
    } catch (err: unknown) {
      const error = err as { errors?: Record<string, string> }
      if (error?.errors) setErrors(error.errors)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 overflow-hidden max-w-120 rounded-2xl border-none [&>button]:hidden">

        {/* Header */}
        <div className="bg-linear-to-br from-[#e8f0f8] to-[#c8ddf0] px-6 pt-5.5 pb-4.5">
          <DialogHeader className="space-y-0">
            <p className="text-[10px] font-semibold tracking-[0.08em] uppercase text-[#155183] opacity-60 mb-1">
              Management
            </p>
            <DialogTitle className="text-[17px] font-bold text-[#0d2e47] tracking-tight m-0">
              Create Farm
            </DialogTitle>
          </DialogHeader>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-3.5 max-h-105 overflow-y-auto">

          <div>
            <FieldLabel>Name</FieldLabel>
            <TextInput
                type="text"
                placeholder="Sunny Farm"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                error={!!errors.name}
            />
            <FieldError message={errors.name} />
          </div>

          <div>
            <FieldLabel>Description</FieldLabel>
            <TextInput
                type="text"
                placeholder="A brief description of the farm"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                error={!!errors.description}
            />
            <FieldError message={errors.description} />
          </div>

          <div>
            <FieldLabel>Assign Owner</FieldLabel>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button
                    className={`w-full flex items-center justify-between px-2.75 py-2 text-[13px] rounded-lg border-[1.5px] bg-white outline-none transition-colors ${
                        errors.owner_id
                        ? "border-red-400"
                        : "border-[#e2eaf2] hover:border-[#155183]"
                    } ${selectedUser ? "text-[#0d2e47]" : "text-[#9ab0c4]"}`}
                    >
                    <span>
                        {
                        isLoading ? "Loading users..."
                         :
                        selectedUser
                        ? `${selectedUser.first_name} ${selectedUser.last_name}`
                        : "Select a user"}
                    </span>
                    <ChevronDown size={13} className="text-[#9ab0c4] shrink-0" />
                    </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                    className="w-[--radix-dropdown-menu-trigger-width] rounded-lg border-[1.5px] border-[#e2eaf2] shadow-sm p-1"
                    align="start"
                >
                    {users.map((r: User) => (
                    <DropdownMenuItem
                        key={r.id}
                        onSelect={() => {
                        set("owner_id", r.id.toString())
                        setSelectedUser(r)
                        }}
                        className="flex items-center justify-between text-[13px] text-[#0d2e47] rounded-md px-3 py-2 cursor-pointer focus:bg-[#e8f0f8] focus:text-[#155183]"
                    >
                        <span>{`${r.first_name} ${r.last_name}`}</span>
                        {form.owner_id === r.id.toString() && (
                        <Check size={12} className="text-[#155183]" />
                        )}
                    </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
                </DropdownMenu>
            <FieldError message={errors.owner_id} />
        </div>

          <div>
            <FieldLabel>Password</FieldLabel>
            <TextInput
                type="text"
                placeholder="Password"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                error={!!errors.password}
            />
            <FieldError message={errors.password} />
          </div>

          <div>
            <FieldLabel>Confirm Password</FieldLabel>
            <TextInput
                type="text"
                placeholder="Password"
                value={form.confirmPassword}
                onChange={(e) => set("confirmPassword", e.target.value)}
                error={!!errors.confirmPassword}
            />
            <FieldError message={errors.confirmPassword} />
          </div>

        </div>

        {/* Divider */}
        <div className="h-px bg-[#f0f4f8] shrink-0" />

        {/* Footer */}
        <div className="px-6 py-3.5 flex items-center justify-between bg-[#fafbfc] shrink-0">
          <p className="text-[11px] text-[#9ab0c4]">All fields are required</p>
          <div className="flex gap-2">
            <button
              onClick={() => onOpenChange(false)}
              className="text-[12px] font-semibold px-4 py-2 rounded-lg border-[1.5px] border-[#e2eaf2] bg-white text-[#9ab0c4] cursor-pointer hover:border-[#c5d5e4] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isPending}
              className={`text-[12px] font-semibold px-4 py-2 rounded-lg border-none text-white tracking-wide transition-colors ${
                isPending ? "bg-[#9ab0c4] cursor-not-allowed" : "bg-[#155183] hover:bg-[#0d3d6b]"
              }`}
            >
              {isPending ? "Creating…" : "Create Farm"}
            </button>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  )
}