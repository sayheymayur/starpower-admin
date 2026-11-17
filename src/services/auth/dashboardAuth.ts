import { API_CONFIG } from '../api/config';
import type {
  AdminUser,
  AuthApiResponse,
  CreateAdminInput,
  CreateRoleInput,
  LoginResponse,
  RoleDefinition,
  ScopeModule,
  UpdateAdminInput,
  UpdateRoleInput,
} from './types';

export const TOKEN_KEY = 'dashboardToken';
export const USER_KEY = 'dashboardUser';
export const SCOPES_KEY = 'dashboardScopes';
export const UNAUTHORIZED_EVENT = 'auth:unauthorized';

class DashboardAuthService {
  private baseUrl = API_CONFIG.BASE_URL;

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  getUser(): (AdminUser & { email?: string }) | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  getScopes(): string[] {
    const raw = localStorage.getItem(SCOPES_KEY);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private storeSession(user: AdminUser, scopes?: string[]): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    if (scopes) {
      localStorage.setItem(SCOPES_KEY, JSON.stringify(scopes));
    }
  }

  isRoot(): boolean {
    return Boolean(this.getUser()?.isRoot);
  }

  isAdmin(): boolean {
    const user = this.getUser();
    const roleId = user?.roleId ?? user?.role;
    // StarPower product root (legacy admin migrated to sayheyadmin on SayHey only)
    return roleId === 'astroadmin' || roleId === 'admin' || roleId === 'sayheyadmin';
  }

  isStarPowerProduct(): boolean {
    return this.getUser()?.product === 'starpower';
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(SCOPES_KEY);
    localStorage.removeItem('auth_session');
    localStorage.removeItem('authToken');
  }

  handleUnauthorized(): void {
    this.logout();
    window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT));
  }

  async login(login: string, password: string): Promise<LoginResponse> {
    const res = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        login: login.trim(),
        password,
        product: 'starpower',
      }),
    });

    const data: LoginResponse = await res.json();

    if (!res.ok || !data.success || !data.token || !data.user) {
      const wrongProduct =
        res.status === 403 && (data as { accountProduct?: string }).accountProduct
          ? ` This account belongs to ${(data as { accountProduct?: string }).accountProduct}.`
          : '';
      throw new Error((data.message ?? 'Login failed') + wrongProduct);
    }

    if (data.user.product && data.user.product !== 'starpower') {
      this.logout();
      throw new Error('This account cannot access StarPower Admin');
    }

    localStorage.setItem(TOKEN_KEY, data.token);
    this.storeSession(data.user, data.scopes ?? []);
    return data;
  }

  async fetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const res = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    const data = await res.json().catch(() => ({}));

    if (res.status === 401) {
      this.handleUnauthorized();
      throw new Error('Session expired. Please log in again.');
    }

    if (!data.success) {
      const err = new Error(data.message ?? 'Request failed') as Error & {
        status?: number;
        errors?: string[];
        requiredScope?: string;
      };
      err.status = res.status;
      err.errors = data.errors;
      err.requiredScope = data.requiredScope;
      throw err;
    }

    return data as T;
  }

  async getProfile(): Promise<{ user: AdminUser; scopes: string[] }> {
    const token = this.getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const res = await fetch(`${this.baseUrl}/auth/profile`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json().catch(() => ({}));

    if (res.status === 401 || res.status === 403) {
      this.handleUnauthorized();
      throw new Error(
        res.status === 403
          ? 'Access denied. Please sign in with a different account.'
          : 'Session expired. Please log in again.'
      );
    }

    if (!res.ok || !data.success) {
      const err = new Error(data.message ?? 'Request failed') as Error & { status?: number };
      err.status = res.status;
      throw err;
    }

    const user = data.data as AdminUser;
    const scopes = data.scopes ?? [];
    this.storeSession(user, scopes);
    return { user, scopes };
  }

  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    await this.fetch('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  async listAdmins(): Promise<AdminUser[]> {
    const res = await this.fetch<AuthApiResponse<AdminUser[]>>('/auth/admins');
    return res.data ?? [];
  }

  async createAdmin(input: CreateAdminInput): Promise<AdminUser> {
    const res = await this.fetch<AuthApiResponse<AdminUser>>('/auth/admins', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return res.data!;
  }

  async updateAdmin(id: string, input: UpdateAdminInput): Promise<AdminUser> {
    const res = await this.fetch<AuthApiResponse<AdminUser>>(
      `/auth/admins/${encodeURIComponent(id)}`,
      {
        method: 'PUT',
        body: JSON.stringify(input),
      }
    );
    return res.data!;
  }

  async setAdminEnabled(id: string, enabled: boolean): Promise<AdminUser> {
    const res = await this.fetch<AuthApiResponse<AdminUser>>(
      `/auth/admins/${encodeURIComponent(id)}/enabled`,
      {
        method: 'PATCH',
        body: JSON.stringify({ enabled }),
      }
    );
    return res.data!;
  }

  async deleteAdmin(id: string): Promise<void> {
    await this.fetch(`/auth/admins/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  }

  async listScopes(): Promise<ScopeModule[]> {
    const res = await this.fetch<AuthApiResponse<ScopeModule[]>>('/auth/scopes');
    return res.data ?? [];
  }

  async listRoles(): Promise<RoleDefinition[]> {
    const res = await this.fetch<AuthApiResponse<RoleDefinition[]>>('/auth/roles');
    return res.data ?? [];
  }

  async getRole(roleId: string): Promise<RoleDefinition> {
    const res = await this.fetch<AuthApiResponse<RoleDefinition>>(
      `/auth/roles/${encodeURIComponent(roleId)}`
    );
    return res.data!;
  }

  async createRole(input: CreateRoleInput): Promise<RoleDefinition> {
    const res = await this.fetch<AuthApiResponse<RoleDefinition>>('/auth/roles', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return res.data!;
  }

  async updateRole(roleId: string, input: UpdateRoleInput): Promise<RoleDefinition> {
    const res = await this.fetch<AuthApiResponse<RoleDefinition>>(
      `/auth/roles/${encodeURIComponent(roleId)}`,
      {
        method: 'PATCH',
        body: JSON.stringify(input),
      }
    );
    return res.data!;
  }

  async replaceRoleScopes(roleId: string, scopes: string[]): Promise<string[]> {
    const res = await this.fetch<AuthApiResponse<{ scopes: string[] }>>(
      `/auth/roles/${encodeURIComponent(roleId)}/scopes`,
      {
        method: 'PUT',
        body: JSON.stringify({ scopes }),
      }
    );
    return res.data?.scopes ?? scopes;
  }

  async deleteRole(roleId: string): Promise<void> {
    await this.fetch(`/auth/roles/${encodeURIComponent(roleId)}`, {
      method: 'DELETE',
    });
  }
}

export const authService = new DashboardAuthService();
