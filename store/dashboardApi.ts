import { useQuery } from "@tanstack/react-query"

async function fetchDashboard(from?: string | null, to?: string | null) {
  if (from && to) {
    return fetch(`/api/dashboard?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`).then(r => r.json())
  }
  return fetch(`/api/dashboard`).then(r => r.json())
}

export function useDashboardQuery(from?: string | null, to?: string | null) {
  return useQuery({
    queryKey: ["dashboard", from, to],
    queryFn: () => fetchDashboard(from, to),
    refetchInterval: 30000,
  })
}