import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useMemo,
} from 'react';
import {
  authService,
  UNAUTHORIZED_EVENT,
  type AuthUser,
} from '../services/auth';
import { can as checkScope, isAdminRole } from '../utils/scopes';

interface AuthContextType {
  user: AuthUser | null;
  scopes: string[];
  login: (login: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isRoot: boolean;
  isAdmin: boolean;
  can: (scope: string) => boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [scopes, setScopes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const clearSession = useCallback(() => {
    authService.logout();
    setUser(null);
    setScopes([]);
  }, []);

  const applyProfile = useCallback((profile: AuthUser, nextScopes: string[]) => {
    setUser(profile);
    setScopes(nextScopes);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const token = authService.getToken();
      if (!token) {
        if (!cancelled) setIsLoading(false);
        return;
      }

      const cached = authService.getUser();
      const cachedScopes = authService.getScopes();
      if (cached && !cancelled) {
        setUser({ ...cached, isAuthenticated: true });
        setScopes(cachedScopes);
      }

      try {
        const { user: profile, scopes: nextScopes } = await authService.getProfile();
        if (!cancelled) {
          if (profile.product && profile.product !== 'starpower') {
            clearSession();
          } else {
            applyProfile(
              { ...profile, email: profile.gmail, isAuthenticated: true },
              nextScopes
            );
          }
        }
      } catch (err) {
        if (cancelled) return;

        const status = (err as Error & { status?: number }).status;
        const tokenGone = !authService.getToken();
        const sessionExpired =
          err instanceof Error &&
          (err.message.includes('Session expired') ||
            err.message.includes('Not authenticated') ||
            err.message.includes('Access denied'));

        if (tokenGone || sessionExpired || status === 403 || !cached) {
          clearSession();
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, [clearSession, applyProfile]);

  useEffect(() => {
    const onUnauthorized = () => clearSession();
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, [clearSession]);

  const login = async (loginField: string, password: string) => {
    const res = await authService.login(loginField, password);
    setUser({ ...res.user!, isAuthenticated: true });
    setScopes(res.scopes ?? authService.getScopes());
  };

  const logout = () => {
    clearSession();
  };

  const refreshProfile = useCallback(async () => {
    try {
      const { user: profile, scopes: nextScopes } = await authService.getProfile();
      applyProfile(
        { ...profile, email: profile.gmail, isAuthenticated: true },
        nextScopes
      );
    } catch {
      clearSession();
    }
  }, [applyProfile, clearSession]);

  const can = useCallback(
    (scope: string) => checkScope(scope, scopes),
    [scopes]
  );

  const roleId = user?.roleId ?? user?.role;

  const value: AuthContextType = useMemo(
    () => ({
      user,
      scopes,
      login,
      logout,
      isLoading,
      isRoot: Boolean(user?.isRoot),
      isAdmin: isAdminRole(roleId),
      can,
      refreshProfile,
    }),
    [user, scopes, isLoading, roleId, can, refreshProfile]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
