import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  getAccessToken,
  getSessionVersion,
  isAccessTokenExpired,
  onSessionExpired,
  onSessionVersionChange,
  refreshAccessToken,
  setAccessToken,
  setSessionTokens,
} from '@/shared/api/client';
import { clearAllIdempotencyKeys } from '@/shared/api/idempotency';
import type { AuthorizationMe, SignUpInput, UserResponse } from '@/types/api';
import { fetchCurrentUser } from '@/features/users/api';
import {
  confirmEmailVerification as apiConfirmEmailVerification,
  exchangeSsoCode as apiExchangeSsoCode,
  fetchAuthorizationMe,
  resendEmailVerification as apiResendEmailVerification,
  signIn as apiSignIn,
  signOut as apiSignOut,
  signUp as apiSignUp,
} from '../api';
import { canAccess, assertKnownCapabilities } from '@/shared/lib/capabilities';
import {
  clearPendingUser,
  isEmailVerificationRequiredError,
  isUserEmailVerified,
  loadPendingUser,
  persistPendingUser,
  recordVerificationResendAttempt,
} from '../auth-session';
import {
  AccountSuspendedError,
  isAccountSuspendedError,
  markAccountSuspended,
  redirectToSuspendedAccount,
  shouldSkipSuspendedAuthBootstrap,
} from '@/shared/api/auth-errors';
import { AuthContext, type AuthState } from '../auth-context';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [authorization, setAuthorization] = useState<AuthorizationMe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionVersion, setSessionVersion] = useState(getSessionVersion);

  useEffect(() => onSessionVersionChange(() => setSessionVersion(getSessionVersion())), []);

  const refreshProfile = useCallback(async () => {
    if (shouldSkipSuspendedAuthBootstrap()) {
      return;
    }

    const [profile, currentUser] = await Promise.all([
      fetchAuthorizationMe(),
      fetchCurrentUser(),
    ]);
    assertKnownCapabilities(profile.capabilities);
    setAuthorization(profile);
    setUser(currentUser);
    clearPendingUser();
  }, []);

  useEffect(() => {
    return onSessionExpired(() => {
      const pendingUser = loadPendingUser();
      if (pendingUser && !isUserEmailVerified(pendingUser)) {
        setUser(pendingUser);
        setAuthorization(null);
        return;
      }
      clearPendingUser();
      setUser(null);
      setAuthorization(null);
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      if (shouldSkipSuspendedAuthBootstrap()) {
        setAccessToken(null);
        clearPendingUser();
        setUser(null);
        setAuthorization(null);
        if (!cancelled) {
          setIsLoading(false);
        }
        return;
      }

      const pendingUser = loadPendingUser();
      let token = getAccessToken();
      if (isAccessTokenExpired(token)) {
        token = await refreshAccessToken();
      }

      if (!token) {
        if (pendingUser && !isUserEmailVerified(pendingUser)) {
          setUser(pendingUser);
          setAuthorization(null);
        }
        if (!cancelled) {
          setIsLoading(false);
        }
        return;
      }

      try {
        await refreshProfile();
      } catch (error) {
        if (cancelled) {
          return;
        }
        if (isAccountSuspendedError(error)) {
          setAccessToken(null);
          clearPendingUser();
          setUser(null);
          setAuthorization(null);
          redirectToSuspendedAccount();
        } else if (
          isEmailVerificationRequiredError(error) &&
          pendingUser &&
          !isUserEmailVerified(pendingUser)
        ) {
          setUser(pendingUser);
          setAuthorization(null);
        } else {
          setAccessToken(null);
          clearPendingUser();
          setUser(null);
          setAuthorization(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [refreshProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    const rejectSuspendedLogin = async (): Promise<never> => {
      setAccessToken(null);
      clearPendingUser();
      setUser(null);
      setAuthorization(null);
      try {
        await apiSignOut();
      } catch {
        // Anonymous or expired sign-out is fine.
      }
      markAccountSuspended();
      throw new AccountSuspendedError();
    };

    const clearFailedLogin = () => {
      setAccessToken(null);
      clearPendingUser();
      setUser(null);
      setAuthorization(null);
    };

    try {
      const result = await apiSignIn(email, password);
      if (!result.user.isActive) {
        await rejectSuspendedLogin();
      }

      setSessionTokens({
        accessToken: result.accessToken,
      });
      setUser(result.user);

      if (!result.user.isEmailVerified) {
        persistPendingUser(result.user);
        setAuthorization(null);
        recordVerificationResendAttempt();
        return { isEmailVerified: false, verificationEmailSent: true };
      }

      const [profile, currentUser] = await Promise.all([
        fetchAuthorizationMe(),
        fetchCurrentUser(),
      ]);

      if (!currentUser.isActive) {
        await rejectSuspendedLogin();
      }

      assertKnownCapabilities(profile.capabilities);
      setAuthorization(profile);
      setUser(currentUser);
      clearPendingUser();
      return { isEmailVerified: true };
    } catch (error) {
      if (error instanceof AccountSuspendedError) {
        throw error;
      }
      if (isAccountSuspendedError(error)) {
        await rejectSuspendedLogin();
      }
      clearFailedLogin();
      throw error;
    }
  }, []);

  const completeSso = useCallback(async (exchangeCode: string) => {
    const rejectSuspendedLogin = async (): Promise<never> => {
      setAccessToken(null);
      clearPendingUser();
      setUser(null);
      setAuthorization(null);
      try {
        await apiSignOut();
      } catch {
        // Anonymous or expired sign-out is fine.
      }
      markAccountSuspended();
      throw new AccountSuspendedError();
    };

    const clearFailedLogin = () => {
      setAccessToken(null);
      clearPendingUser();
      setUser(null);
      setAuthorization(null);
    };

    try {
      const result = await apiExchangeSsoCode(exchangeCode);
      if (!result.user.isActive) {
        await rejectSuspendedLogin();
      }

      setSessionTokens({
        accessToken: result.accessToken,
      });
      setUser(result.user);

      const [profile, currentUser] = await Promise.all([
        fetchAuthorizationMe(),
        fetchCurrentUser(),
      ]);

      if (!currentUser.isActive) {
        await rejectSuspendedLogin();
      }

      assertKnownCapabilities(profile.capabilities);
      setAuthorization(profile);
      setUser(currentUser);
      clearPendingUser();
      return { isEmailVerified: true };
    } catch (error) {
      if (error instanceof AccountSuspendedError) {
        throw error;
      }
      if (isAccountSuspendedError(error)) {
        await rejectSuspendedLogin();
      }
      clearFailedLogin();
      throw error;
    }
  }, []);

  const signUp = useCallback(async (input: SignUpInput) => {
    const { result, message } = await apiSignUp(input);
    setSessionTokens({
      accessToken: result.accessToken,
    });

    const userFromSignup: UserResponse = {
      reference: '',
      email: result.user.email,
      firstName: input.firstName,
      lastName: input.lastName,
      isActive: true,
      isEmailVerified: result.user.isEmailVerified,
      role: null,
      department: null,
    };

    setUser(userFromSignup);
    setAuthorization(null);
    persistPendingUser(userFromSignup);
    return message;
  }, []);

  const confirmEmailVerification = useCallback(async (token: string) => {
    const message = await apiConfirmEmailVerification(token);
    await refreshProfile();
    return message;
  }, [refreshProfile]);

  const resendEmailVerification = useCallback(async () => {
    return apiResendEmailVerification();
  }, []);

  const signOut = useCallback(async () => {
    try {
      await apiSignOut();
    } finally {
      clearAllIdempotencyKeys();
      setAccessToken(null);
      clearPendingUser();
      setUser(null);
      setAuthorization(null);
    }
  }, []);

  const hasCapability = useCallback(
    (capability: string) =>
      canAccess(authorization?.capabilities, capability),
    [authorization],
  );

  const value = useMemo<AuthState>(
    () => ({
      user,
      authorization,
      isAuthenticated: Boolean(user && getAccessToken()),
      isLoading,
      signIn,
      completeSso,
      signUp,
      confirmEmailVerification,
      resendEmailVerification,
      signOut,
      refreshProfile,
      hasCapability,
      sessionVersion,
    }),
    [
      user,
      authorization,
      isLoading,
      signIn,
      completeSso,
      signUp,
      confirmEmailVerification,
      resendEmailVerification,
      signOut,
      refreshProfile,
      hasCapability,
      sessionVersion,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
