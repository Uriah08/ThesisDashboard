import { useQuery } from "@tanstack/react-query"

async function fetchDashboard(period?: string | null) {
  const url = period ? `/api/dashboard?period=${period}` : `/api/dashboard`
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to fetch dashboard data")
  return res.json()
}

export function useDashboardQuery(period?: string | null) {
  return useQuery({
    queryKey: ["dashboard", period],
    queryFn: () => fetchDashboard(period),
    refetchInterval: 30000,
  })
}