// lib/verifyDjangoPassword.ts
import { pbkdf2, randomBytes, timingSafeEqual } from "crypto"
import { promisify } from "util"

const pbkdf2Async = promisify(pbkdf2)

const ALGORITHM  = "pbkdf2_sha256"
const ITERATIONS = 1_000_000  // confirmed from: python manage.py shell → PBKDF2PasswordHasher.iterations
const KEY_LENGTH = 32
const DIGEST     = "sha256"

// Alphanumeric only — mirrors Django's get_random_string charset
// Avoids "$" collisions in the split("$") format
const SALT_CHARS  = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
const SALT_LENGTH = 22

function randomSalt(): string {
  const bytes = randomBytes(SALT_LENGTH)
  return Array.from(bytes)
    .map((b) => SALT_CHARS[b % SALT_CHARS.length])
    .join("")
}

// ── Verify ─────────────────────────────────────────────────────────────────────
// Reads iterations from the stored hash so it works regardless of when
// the password was created (even if ITERATIONS changes in the future).
export async function verifyDjangoPassword(
  plain: string,
  hashed: string
): Promise<boolean> {
  const [algorithm, iterations, salt, hash] = hashed.split("$")

  if (algorithm !== "pbkdf2_sha256") return false

  const derived = await pbkdf2Async(
    plain,
    salt,
    Number(iterations),
    KEY_LENGTH,
    DIGEST
  )

  const derivedBase64 = derived.toString("base64")

  if (derivedBase64.length !== hash.length) return false

  return timingSafeEqual(
    Buffer.from(derivedBase64),
    Buffer.from(hash)
  )
}

// ── Hash ───────────────────────────────────────────────────────────────────────
// Produces: pbkdf2_sha256$1000000$<salt>$<base64-hash>
// Uses the exact same params as verifyDjangoPassword so round-trips always work.
export async function hashDjangoPassword(plain: string): Promise<string> {
  const salt    = randomSalt()
  const derived = await pbkdf2Async(plain, salt, ITERATIONS, KEY_LENGTH, DIGEST)
  const hash    = derived.toString("base64")

  return `${ALGORITHM}$${ITERATIONS}$${salt}$${hash}`
}