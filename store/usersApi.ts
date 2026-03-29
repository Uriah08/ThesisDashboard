import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export interface User {
  id: number
  username: string
  first_name: string
  last_name: string
  email: string
  role: string
  is_active: boolean
  is_staff: boolean
  is_superuser: boolean
  is_complete: boolean
  profile_picture?: string
  mobile_number: string
  address: string
  birthday?: string
  date_joined: string
  last_login?: string
  _count: {
    farms_farmmodel: number
    farms_farmmodel_members: number
    announcements_announcementmodel: number
    trays_sessiontraymodel: number
  }
}
 
export interface RegisterUserPayload {
  first_name: string
  last_name: string
  username: string
  email: string
  password: string
  role: string
  mobile_number: string
  address: string
  birthday?: string | null
}
 
export interface RegisterUserError extends Error {
  errors?: Record<string, string>
  status?: number
}

async function fetchUsers() {
  const res = await fetch("/api/clients")
  if (!res.ok) throw new Error("Failed to fetch users")
  return res.json()
}

export function useUsersQuery() {
  return useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
    refetchInterval: 30000,
  })
}

async function registerUser(payload: RegisterUserPayload): Promise<User> {
  const res = await fetch("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
 
  const data = await res.json()
 
  if (!res.ok) {
    throw Object.assign(
      new Error(data.message ?? "Registration failed"),
      { errors: data.errors ?? {}, status: res.status }
    )
  }
 
  return data
}

export function useRegisterUserMutation() {
  const queryClient = useQueryClient()
 
  return useMutation<User, RegisterUserError, RegisterUserPayload>({
    mutationFn: registerUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })
}