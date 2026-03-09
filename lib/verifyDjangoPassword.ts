// lib/verifyDjangoPassword.ts
import { pbkdf2, timingSafeEqual } from "crypto"
import { promisify } from "util"

const pbkdf2Async = promisify(pbkdf2)

export async function verifyDjangoPassword(plain: string, hashed: string): Promise<boolean> {
  const [algorithm, iterations, salt, hash] = hashed.split("$")

  if (algorithm !== "pbkdf2_sha256") return false

  const derived = await pbkdf2Async(
    plain,
    salt,
    Number(iterations),
    32,
    "sha256"
  )

  const derivedBase64 = derived.toString("base64")

  return timingSafeEqual(
    Buffer.from(derivedBase64),
    Buffer.from(hash)
  )
}