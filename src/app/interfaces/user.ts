export interface User {
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  role?: 'user' | 'admin';
  address?: {
    street: string;
    city: string;
    buildingNo: string;
    floorNo: string;
    flatNo: string;
  };
}

export interface AuthResponse {
  user: User;
  token: string;
  message?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}
