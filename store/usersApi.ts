import { useQuery } from "@tanstack/react-query"

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