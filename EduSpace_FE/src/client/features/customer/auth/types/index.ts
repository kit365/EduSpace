export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  userType: 'guest' | 'host';
  agreeToTerms: boolean;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  userType: 'guest' | 'host' | 'admin';
}
