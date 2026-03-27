// ==========================================
// Auth API Types (maps to BE DTOs)
// ==========================================

export interface LoginRequest {
  email: string;
  password: string;
  otp?: string;
}

export interface RegisterHostPartnerPart {
  applicantType: string;
  phone?: string;
  address: string;
  documentFrontUrl?: string;
  documentBackUrl?: string;
  businessLicenseUrl?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  hostPartnerApplication?: RegisterHostPartnerPart;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

// Re-export store types from global
export type { AuthState, AuthActions, AuthStore, AuthTokens } from '../../../../../stores/authStore';

// ==========================================
// Auth Form Types (FE-only, for UI forms)
// ==========================================

export interface LoginFormData {
  email: string;
  password: string;
  otp?: string;
  rememberMe?: boolean;
}

export interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  userType: 'guest' | 'host' | 'admin';
}

