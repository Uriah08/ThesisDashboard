import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

interface CreateFarmInput {
  name: string
  description?: string
  image_url?: string
  password: string
  confirmPassword: string
  owner_id: string
}

interface Farm {
  id: number
  name: string
  description?: string | null
  image_url?: string | null
  create_at: string
}

async function fetchFarms() {
  const res = await fetch("/api/farms")
  if (!res.ok) throw new Error("Failed to fetch farms")
  return res.json()
}

export function useFarmsQuery() {
  return useQuery({
    queryKey: ["farms"],
    queryFn: fetchFarms,
    refetchInterval: 30000,
  })
}

import { DateRange } from "react-day-picker"

async function fetchFarm(id: string, range?: DateRange) {
  const params = new URLSearchParams()
  if (range?.from && range?.to) {
    const to = new Date(range.to)
    to.setHours(23, 59, 59, 999)

    params.set("from", range.from.toISOString())
    params.set("to", to.toISOString())
  }

  const qs = params.size ? `?${params}` : ""
  const res = await fetch(`/api/farms/${id}${qs}`)
  if (!res.ok) throw new Error("Failed to fetch farm")
  return res.json()
}

export function useFarmQuery(id: string, range?: DateRange) {
  return useQuery({
    queryKey: ["farm", id, range?.from, range?.to],  // re-fetches when range changes
    queryFn:  () => fetchFarm(id, range),
    enabled:  !!id,
    refetchInterval: 30000,
  })
}

async function createFarm(data: CreateFarmInput): Promise<Farm> {
  const res = await fetch("/api/farms", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(errorData?.message || "Failed to create farm")
  }

  return res.json()
}

export function useCreateFarm() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createFarm,
    onSuccess: () => {
      // Invalidate the farms list so it refetches
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === "farms",
      })
    },
  })
}