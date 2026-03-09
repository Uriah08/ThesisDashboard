import { useQuery } from "@tanstack/react-query"

async function fetchDashboard() {
  const res = await fetch("/api/dashboard")
  if (!res.ok) throw new Error("Failed to fetch dashboard data")
  return res.json()
}

export function useDashboardQuery() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboard,
    refetchInterval: 30000,
  })
}