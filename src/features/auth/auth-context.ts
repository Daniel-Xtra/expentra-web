import { createContext } from 'react';
import type { AuthorizationMe, SignUpInput, UserResponse } from '@/types/api';

export type AuthState = {
  user: UserResponse | null;
  authorization: AuthorizationMe | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ isEmailVerified: boolean; verificationEmailSent?: boolean }>;
  signUp: (input: SignUpInput) => Promise<string>;
  confirmEmailVerification: (token: string) => Promise<string>;
  resendEmailVerification: () => Promise<string>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  hasCapability: (capability: string) => boolean;
  sessionVersion: number;
};

export const AuthContext = createContext<AuthState | null>(null);
