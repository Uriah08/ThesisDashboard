import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

interface CreateAnnouncementPayload {
  title: string
  content: string
  status: "active" | "inactive"
  expires_at?: string
}

async function fetchAnnouncements() {
  const res = await fetch("/api/announcement")
  if (!res.ok) throw new Error("Failed to fetch announcements")
  return res.json()
}

async function createAnnouncement(payload: CreateAnnouncementPayload) {
  const res = await fetch("/api/announcement", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error("Failed to create announcement")
  return res.json()
}

export function useAnnouncementsQuery() {
  return useQuery({
    queryKey: ["announcements"],
    queryFn: fetchAnnouncements,
    refetchInterval: 30000,
  })
}

export function useCreateAnnouncementMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createAnnouncement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
    },
  })
}