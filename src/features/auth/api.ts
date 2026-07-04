import {
  api,
  getAccessToken,
  refreshAccessToken,
  setSessionTokens,
} from '@/shared/api/client';
import type {
  ApiResponse,
  AuthorizationMe,
  LoginResult,
  RegisterResult,
  SignUpInput,
} from '@/types/api';

export async function signUp(input: SignUpInput): Promise<{ result: RegisterResult; message: string }> {
  const { data } = await api.post<ApiResponse<RegisterResult>>('/auth/sign-up', input);

  if (!data.data) {
    throw new Error(data.message || 'Registration failed');
  }

  return { result: data.data, message: data.message };
}

export async function signIn(email: string, password: string): Promise<LoginResult> {
  const { data } = await api.post<ApiResponse<LoginResult>>('/auth/sign-in', {
    email,
    password,
  });

  if (!data.data) {
    throw new Error(data.message || 'Sign-in failed');
  }

  return data.data;
}

export async function signOut(): Promise<void> {
  await api.post('/auth/sign-out');
}

export async function refreshTokens(): Promise<string> {
  const token = await refreshAccessToken();
  if (!token) {
    throw new Error('Session expired. Please sign in again.');
  }
  return token;
}

export async function requestPasswordReset(email: string): Promise<string> {
  const { data } = await api.post<ApiResponse<unknown>>('/auth/password-resets', { email });
  return data.message || 'Password reset email has been sent.';
}

export async function validatePasswordResetToken(token: string): Promise<void> {
  await api.post('/auth/password-resets/validate', { token });
}

export async function confirmPasswordReset(
  token: string,
  newPassword: string,
): Promise<string> {
  const { data } = await api.post<ApiResponse<unknown>>('/auth/password-resets/confirm', {
    token,
    newPassword,
  });
  return data.message || 'Password reset successful';
}

export async function fetchAuthorizationMe(): Promise<AuthorizationMe> {
  const { data } = await api.get<ApiResponse<AuthorizationMe>>('/authorization/me');

  if (!data.data) {
    throw new Error(data.message || 'Failed to load profile');
  }

  return data.data;
}

export async function confirmEmailVerification(token: string): Promise<string> {
  const { data } = await api.post<ApiResponse<{ accessToken: string }>>(
    '/auth/email-verifications/confirm',
    { token },
  );
  if (!data.data?.accessToken) {
    throw new Error(data.message || 'Email verification failed');
  }
  setSessionTokens({ accessToken: data.data.accessToken });
  return data.message || 'Email verified successfully';
}

export async function resendEmailVerification(): Promise<string> {
  if (!getAccessToken()) {
    throw new Error('Session expired. Please sign in again.');
  }

  const { data } = await api.post<ApiResponse<unknown>>('/auth/email-verifications/resend');
  return data.message || 'Verification email sent';
}
