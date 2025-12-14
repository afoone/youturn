import { Enterprise } from './enterprise.model';

export interface User {
  _id: string;
  username: string;
  email: string;
  roles: string[];
  admin: boolean;
  enterprise?: Enterprise | string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  roles?: string[];
  enterpriseId?: string;
  admin?: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
}

