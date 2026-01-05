import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../utils/jwt.util'

export interface AuthRequest extends Request {
  user?: {
    userId: string
    email: string
    roles: string[]
    admin: boolean
    enterpriseId?: string
  }
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

  if (!token) {
    res.status(401).json({ message: 'Access token required' })
    return
  }

  const payload = verifyToken(token)
  if (!payload) {
    res.status(403).json({ message: 'Invalid or expired token' })
    return
  }

  req.user = {
    userId: payload.userId,
    email: payload.email,
    roles: payload.roles,
    admin: payload.admin,
    enterpriseId: payload.enterpriseId,
  }

  next()
}

export function requireRole(...allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' })
      return
    }

    // Si es admin, tiene acceso a todo
    if (req.user.admin) {
      next()
      return
    }

    const hasRole = req.user.roles.some((role) => allowedRoles.includes(role))
    if (!hasRole) {
      res.status(403).json({ message: 'Insufficient permissions' })
      return
    }

    next()
  }
}

export function requireAdmin() {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' })
      return
    }

    if (!req.user.admin) {
      res.status(403).json({ message: 'Admin access required' })
      return
    }

    next()
  }
}

