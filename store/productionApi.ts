import { useMutation, useQueryClient } from "@tanstack/react-query"

interface CreateProductionPayload {
  farm_id: string
  title: string
  notes?: string | null
  quantity: number
  total: number
  landing?: string | null
  satisfaction: number
  created_at?: string
}

async function createProduction(payload: CreateProductionPayload) {
  const res = await fetch("/api/production", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  const data = await res.json()

  if (!res.ok) {
    throw { errors: data.errors, message: data.message }
  }

  return data
}

export function useCreateProductionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createProduction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
    },
  })
}