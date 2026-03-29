"use client"

import { useState } from "react"
import { format } from "date-fns"
import { CalendarDays, ChevronDown, Check } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRegisterUserMutation } from "@/store/usersApi"

// ── Types ─────────────────────────────────────────────────────────────────────

interface RegisterUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

interface FormData {
  first_name: string
  last_name: string
  username: string
  email: string
  password: string
  confirm_password: string
  role: string
  mobile_number: string
  address: string
}

type FormErrors = Partial<FormData>

const ROLES = [
  { value: "admin",  label: "Admin" },
  { value: "user", label: "Member" },
]

const INITIAL: FormData = {
  first_name: "",
  last_name: "",
  username: "",
  email: "",
  password: "",
  confirm_password: "",
  role: "",
  mobile_number: "",
  address: "",
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

// ── Main component ────────────────────────────────────────────────────────────

export default function RegisterUserDialog({
  open,
  onOpenChange,
  onSuccess,
}: RegisterUserDialogProps) {
  const [form, setForm] = useState<FormData>(INITIAL)
  const [errors, setErrors] = useState<FormErrors>({})
  const [birthday, setBirthday] = useState<Date | undefined>(undefined)
  const [calOpen, setCalOpen] = useState(false)

  const { mutateAsync, isPending } = useRegisterUserMutation()

  function set(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: "" }))
  }

  function validate(): boolean {
    const e: FormErrors = {}
    if (!form.first_name.trim())    e.first_name       = "Required"
    if (!form.last_name.trim())     e.last_name        = "Required"
    if (!form.username.trim())      e.username         = "Required"
    if (!form.email.trim())         e.email            = "Required"
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email"
    if (!form.password)             e.password         = "Required"
    else if (form.password.length < 8) e.password      = "Min 8 characters"
    if (!form.confirm_password)     e.confirm_password = "Required"
    else if (form.password !== form.confirm_password)
                                    e.confirm_password = "Passwords do not match"
    if (!form.role)                 e.role             = "Required"
    if (!form.mobile_number.trim()) e.mobile_number    = "Required"
    if (!form.address.trim())       e.address          = "Required"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit() {
    if (!validate()) return
    try {
      await mutateAsync({
        first_name:    form.first_name,
        last_name:     form.last_name,
        username:      form.username,
        email:         form.email,
        password:      form.password,
        role:          form.role,
        mobile_number: form.mobile_number,
        address:       form.address,
        birthday:      birthday ? format(birthday, "yyyy-MM-dd") : null,
      })
      setForm(INITIAL)
      setBirthday(undefined)
      onOpenChange(false)
      onSuccess?.()
    } catch (err: unknown) {
        const error = err as { errors?: Record<string, string> }

        if (error?.errors) {
        setErrors(error.errors)
        }
    }
  }

  const selectedRole = ROLES.find((r) => r.value === form.role)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 overflow-hidden gap-0 max-w-120 rounded-2xl border-none [&>button]:hidden">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="bg-linear-to-br from-[#e8f0f8] to-[#c8ddf0] px-6 pt-5.5 pb-4.5 shrink-0">
          <DialogHeader className="space-y-0">
            <p className="text-[10px] font-semibold tracking-[0.08em] uppercase text-[#155183] opacity-60 mb-1">
              Management
            </p>
            <DialogTitle className="text-[17px] font-bold text-[#0d2e47] tracking-tight m-0">
              Register User
            </DialogTitle>
          </DialogHeader>
        </div>

        {/* ── Body ───────────────────────────────────────────────────────── */}
        <div className="px-6 py-5 flex flex-col gap-3.5 max-h-105 overflow-y-auto">

          {/* First / Last name */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>First name</FieldLabel>
              <TextInput
                type="text"
                placeholder="Juan"
                value={form.first_name}
                onChange={(e) => set("first_name", e.target.value)}
                error={!!errors.first_name}
              />
              <FieldError message={errors.first_name} />
            </div>
            <div>
              <FieldLabel>Last name</FieldLabel>
              <TextInput
                type="text"
                placeholder="dela Cruz"
                value={form.last_name}
                onChange={(e) => set("last_name", e.target.value)}
                error={!!errors.last_name}
              />
              <FieldError message={errors.last_name} />
            </div>
          </div>

          {/* Username */}
          <div>
            <FieldLabel>Username</FieldLabel>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[13px] text-[#9ab0c4] pointer-events-none">
                @
              </span>
              <TextInput
                type="text"
                placeholder="juandelacruz"
                value={form.username}
                onChange={(e) => set("username", e.target.value)}
                error={!!errors.username}
                className="pl-6"
                style={{ paddingLeft: 24 }}
              />
            </div>
            <FieldError message={errors.username} />
          </div>

          {/* Email */}
          <div>
            <FieldLabel>Email</FieldLabel>
            <TextInput
              type="email"
              placeholder="juan@example.com"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              error={!!errors.email}
            />
            <FieldError message={errors.email} />
          </div>

          {/* Password / Confirm */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>Password</FieldLabel>
              <TextInput
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                error={!!errors.password}
              />
              <FieldError message={errors.password} />
            </div>
            <div>
              <FieldLabel>Confirm password</FieldLabel>
              <TextInput
                type="password"
                placeholder="••••••••"
                value={form.confirm_password}
                onChange={(e) => set("confirm_password", e.target.value)}
                error={!!errors.confirm_password}
              />
              <FieldError message={errors.confirm_password} />
            </div>
          </div>

          {/* Role — shadcn DropdownMenu */}
          <div>
            <FieldLabel>Role</FieldLabel>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={`w-full flex items-center justify-between px-2.75 py-2 text-[13px] rounded-lg border-[1.5px] bg-white outline-none transition-colors ${
                    errors.role
                      ? "border-red-400"
                      : "border-[#e2eaf2] hover:border-[#155183]"
                  } ${selectedRole ? "text-[#0d2e47]" : "text-[#9ab0c4]"}`}
                >
                  <span>{selectedRole?.label ?? "Select a role"}</span>
                  <ChevronDown size={13} className="text-[#9ab0c4] shrink-0" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] rounded-lg border-[1.5px] border-[#e2eaf2] shadow-sm p-1"
                align="start"
              >
                {ROLES.map((r) => (
                  <DropdownMenuItem
                    key={r.value}
                    onSelect={() => set("role", r.value)}
                    className="flex items-center justify-between text-[13px] text-[#0d2e47] rounded-md px-3 py-2 cursor-pointer focus:bg-[#e8f0f8] focus:text-[#155183]"
                  >
                    <span>{r.label}</span>
                    {form.role === r.value && (
                      <Check size={12} className="text-[#155183]" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <FieldError message={errors.role} />
          </div>

          {/* Mobile + Birthday */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>Mobile number</FieldLabel>
              <TextInput
                type="tel"
                placeholder="+63 9XX XXX XXXX"
                value={form.mobile_number}
                onChange={(e) => set("mobile_number", e.target.value)}
                error={!!errors.mobile_number}
              />
              <FieldError message={errors.mobile_number} />
            </div>

            {/* Birthday — shadcn Calendar inside Popover */}
            <div>
              <FieldLabel>Birthday</FieldLabel>
              <Popover open={calOpen} onOpenChange={setCalOpen}>
                <PopoverTrigger asChild>
                  <button
                    className={`w-full flex items-center justify-between px-2.75 py-2 text-[13px] rounded-lg border-[1.5px] bg-white outline-none transition-colors hover:border-[#155183] ${
                      birthday ? "text-[#0d2e47]" : "text-[#9ab0c4]"
                    } border-[#e2eaf2]`}
                  >
                    <span>
                      {birthday ? format(birthday, "MMM d, yyyy") : "Pick a date"}
                    </span>
                    <CalendarDays size={13} className="text-[#9ab0c4] shrink-0" />
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0 rounded-xl border-[1.5px] border-[#e2eaf2] shadow-sm"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={birthday}
                    onSelect={(date) => {
                      setBirthday(date)
                      setCalOpen(false)
                    }}
                    captionLayout="dropdown"
                    fromYear={1940}
                    toYear={new Date().getFullYear()}
                    initialFocus
                    classNames={{
                      day_selected: "bg-[#155183] text-white hover:bg-[#155183]",
                      day_today: "font-bold text-[#155183]",
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Address */}
          <div>
            <FieldLabel>Address</FieldLabel>
            <TextInput
              type="text"
              placeholder="123 Main St, Quezon City"
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              error={!!errors.address}
            />
            <FieldError message={errors.address} />
          </div>
        </div>

        {/* ── Divider ────────────────────────────────────────────────────── */}
        <div className="h-px bg-[#f0f4f8] shrink-0" />

        {/* ── Footer ─────────────────────────────────────────────────────── */}
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
                isPending
                  ? "bg-[#9ab0c4] cursor-not-allowed"
                  : "bg-[#155183] hover:bg-[#0d3d6b] cursor-pointer"
              }`}
            >
              {isPending ? "Registering…" : "Register User"}
            </button>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  )
}