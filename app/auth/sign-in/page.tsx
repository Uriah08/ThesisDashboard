"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Loader2, Fish } from "lucide-react"
import { useSignInMutation } from "@/store/authApi"

type FormValues = {
  username: string
  password: string
}

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [focused, setFocused] = useState<string | null>(null)

  const { mutate: signIn, isPending, error } = useSignInMutation()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>()

  const onSubmit = (data: FormValues) => {
    signIn(data)
  }

  return (
    <div className="min-h-screen bg-white flex">

      {/* ── Left branding panel ── */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] bg-[#155183] px-16 py-14 relative overflow-hidden">

        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/5" />
        <div className="absolute top-40 -right-10 w-48 h-48 rounded-full bg-white/5" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-white/5" />

        {/* Logo */}
        <div className="flex items-center gap-2 z-10">
          <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
            <Fish size={16} className="text-white" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">FiScan</span>
        </div>

        {/* Center content */}
        <div className="z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
            <span className="text-white/70 text-xs font-medium">Admin Portal</span>
          </div>

          <h2 className="text-4xl font-bold text-white leading-[1.15] mb-5">
            Manage the farms <br />
            of <span className="italic font-serif text-white/60">Naic, Cavite.</span>
          </h2>
          <p className="text-white/40 text-sm font-light leading-relaxed max-w-xs">
            A centralized platform for DOA Naic administrators to oversee sundried fish farm production and sales.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 z-10">
          <div className="w-5 h-px bg-white/20" />
          <p className="text-white/25 text-xs tracking-wide">In partnership with DOA Naic</p>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex flex-1 items-center justify-center px-6 py-12 bg-zinc-50/50">
        <div className="w-full max-w-95">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-8 h-8 rounded-lg bg-[#155183] flex items-center justify-center">
              <Fish size={15} className="text-white" />
            </div>
            <span className="text-[#155183] font-bold text-lg tracking-tight">FiScan</span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-zinc-900 mb-1.5 tracking-tight">Welcome back</h1>
            <p className="text-sm text-zinc-400 font-light">Sign in to your admin account to continue.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">

            {/* Username */}
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="username"
                className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest"
              >
                Username
              </Label>
              <div className={`relative rounded-xl border bg-white transition-all duration-200 ${
                focused === "username"
                  ? "border-[#155183] shadow-[0_0_0_3px_#15518318]"
                  : errors.username
                  ? "border-red-300"
                  : "border-zinc-200"
              }`}>
                <Input
                  id="username"
                  placeholder="your_username"
                  onFocus={() => setFocused("username")}
                  className="border-0 shadow-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm text-zinc-900 placeholder:text-zinc-300 h-11 px-4 rounded-xl"
                  {...register("username", { required: "Username is required." })}
                />
              </div>
              {errors.username && (
                <p className="text-[11px] text-red-500 flex items-center gap-1">
                  <span>⚠</span> {errors.username.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="password"
                className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest"
              >
                Password
              </Label>
              <div className={`relative rounded-xl border bg-white transition-all duration-200 ${
                focused === "password"
                  ? "border-[#155183] shadow-[0_0_0_3px_#15518318]"
                  : errors.password
                  ? "border-red-300"
                  : "border-zinc-200"
              }`}>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  onFocus={() => setFocused("password")}
                  className="border-0 shadow-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm text-zinc-900 placeholder:text-zinc-300 h-11 pl-4 pr-11 rounded-xl"
                  {...register("password", { required: "Password is required." })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-zinc-500 transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[11px] text-red-500 flex items-center gap-1">
                  <span>⚠</span> {errors.password.message}
                </p>
              )}
            </div>

            {/* Server error */}
            {error && (
              <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 flex items-start gap-2">
                <span className="text-red-400 text-sm mt-px">⚠</span>
                <p className="text-xs text-red-600 leading-relaxed">{(error as Error).message}</p>
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              disabled={isPending}
              className="bg-[#155183] hover:bg-[#1a6199] active:bg-[#124672] text-white w-full h-11 rounded-xl font-medium text-sm mt-1 transition-all shadow-[0_2px_8px_#15518330] hover:shadow-[0_4px_16px_#15518340] hover:-translate-y-0.5"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={15} className="animate-spin" />
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </Button>

          </form>

          {/* Footer */}
          <p className="text-center text-[11px] text-zinc-300 mt-8">
            © {new Date().getFullYear()} FiScan · DOA Naic · Restricted Access
          </p>
        </div>
      </div>

    </div>
  )
}