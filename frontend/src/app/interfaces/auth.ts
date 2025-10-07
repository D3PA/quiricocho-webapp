export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface User {
  id: number;
  email: string;
  name: string;
  is_admin: boolean;
  createdAt: string;
}