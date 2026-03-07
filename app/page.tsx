/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useQuery } from "@tanstack/react-query"

async function fetchUsers() {
  const res = await fetch("/api/users")
  const json = await res.json()
  console.log("API response:", json)
  return json
}

export default function UsersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers
  })

  if (isLoading) return <p>Loading...</p>
  if (!data) return <p>No data.</p>

  return (
    <div>
      <h1>Users</h1>
      {(data ?? []).map((user: any) => (
        <div key={user.id}>
          {user.first_name} {user.last_name} - {user.email}
        </div>
      ))}
    </div>
  )
}