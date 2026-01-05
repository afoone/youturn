export const ROLES = {
  ENTERPRISE_ADMIN: 'ENTERPRISE_ADMIN',
  OPERATOR: 'OPERATOR',
} as const

export type Role = typeof ROLES[keyof typeof ROLES]

export const VALID_ROLES = Object.values(ROLES)

