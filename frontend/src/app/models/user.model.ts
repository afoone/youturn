import { Enterprise } from './enterprise.model';
import { Service } from './service.model';

export interface User {
  _id: string;
  email: string;
  nombre?: string;
  apellidos?: string;
  comentario?: string;
  roles: string[];
  admin: boolean;
  enterprise?: Enterprise | string;
  services?: Service[] | string[]; // Servicios asociados (para usuarios OPERATOR)
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const ROLES = {
  ENTERPRISE_ADMIN: 'ENTERPRISE_ADMIN',
  OPERATOR: 'OPERATOR',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

export const VALID_ROLES = Object.values(ROLES);

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  nombre?: string;
  apellidos?: string;
  comentario?: string;
  roles?: string[];
  enterpriseId?: string;
  admin?: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
}

