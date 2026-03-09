import { useMutation, useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"

type SignInPayload = {
  username: string
  password: string
}

type SignInResponse = {
  success: boolean
}

type MeResponse = {
  id: string
  username: string
  email: string
}

async function signIn(payload: SignInPayload): Promise<SignInResponse> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data?.message ?? "Invalid username or password.")
  }

  return data
}

export function useSignInMutation() {
  const router = useRouter()
  return useMutation({
    mutationFn: signIn,
    onSuccess: () => {
      router.push("/dashboard")
    },
    onError: (error: Error) => {
      console.error("Sign in error:", error.message)
    },
  })
}

async function logout() {
  await fetch("/api/auth/logout", { method: "POST" })
}

export function useLogoutMutation() {
  const router = useRouter()
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      router.push("/auth/sign-in")
    },
  })
}

async function fetchMe(): Promise<MeResponse> {
  const res = await fetch("/api/auth/me")
  if (!res.ok) throw new Error("Not authenticated")
  const data = await res.json()
  return data.user
}

export function useMeQuery() {
  return useQuery({
    queryKey: ["me"],
    queryFn: fetchMe,
    retry: false,
  })
}