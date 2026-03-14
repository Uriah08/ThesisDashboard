const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send"

export async function sendPushNotification(
  token: string,
  title: string,
  body: string,
  data: Record<string, unknown> = {}
) {
  const response = await fetch(EXPO_PUSH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify({
      to: token,
      sound: "default",
      title,
      body,
      data,
    }),
  })

  return response.json()
}