import { useQuery } from "@tanstack/react-query"

type HeroStats = {
  farms: number
  logs: number
  totalProduction: number
}

async function fetchHeroStats(): Promise<HeroStats> {
  const res = await fetch("/api/hero")
  if (!res.ok) throw new Error("Failed to fetch hero stats")
  return res.json()
}

export function useHeroStatsQuery() {
  return useQuery<HeroStats>({
    queryKey: ["hero-stats"],
    queryFn: fetchHeroStats,
  })
}