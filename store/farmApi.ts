import { useQuery } from "@tanstack/react-query"

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

async function fetchFarm(id: string) {
  const res = await fetch(`/api/farms/${id}`)
  if (!res.ok) throw new Error("Failed to fetch farm")
  return res.json()
}
 
export function useFarmQuery(id: string) {
  return useQuery({
    queryKey: ["farm", id],
    queryFn: () => fetchFarm(id),
    enabled: !!id,
    refetchInterval: 30000,
  })
}