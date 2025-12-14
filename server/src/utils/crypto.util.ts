import { SHA3 } from 'sha3'

export function hashPassword(password: string): string {
  const hash = new SHA3(512)
  hash.update(password)
  return hash.digest('hex')
}

export function verifyPassword(password: string, hash: string): boolean {
  const passwordHash = hashPassword(password)
  return passwordHash === hash
}

