export interface User {
  _id?: string;
  userId?:number;
  name: string;
  email: string;
  phone: string;
  oldPassword:string;
  newPassword: string;
  confirmPassword: string;
  role?: 'admin' | 'customer';
  address: {
    street: string;
    city: string;
    buildingNo: string;
    floorNo: string;
    flatNo: string;
  };
}

export interface AuthResponse {
  status: string;
  token: string;
  data: {
    user: User;
  };
  message?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}
