export type DashboardRole = string;
export type DashboardProduct = 'sayhey' | 'starpower';

export interface AdminUser {
  id: string;
  username: string;
  gmail: string;
  fullName: string;
  role: DashboardRole;
  roleId?: DashboardRole;
  product?: DashboardProduct;
  isRoot?: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface AuthUser extends AdminUser {
  email?: string;
  isAuthenticated: boolean;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  scopes?: string[];
  user?: AdminUser & { email: string };
}

export interface ProfileResponse {
  success: boolean;
  data?: AdminUser;
  scopes?: string[];
}

export interface AuthApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  errors?: string[];
}

export interface ScopeEndpoint {
  id: string;
  label: string;
  method?: string;
  path?: string;
  command?: string;
  scopes: string[];
}

export interface ScopeModule {
  id: string;
  label: string;
  group: 'core' | 'astro' | 'admin' | string;
  parent?: string;
  /** Legacy module-level scopes (when endpoints[] absent). */
  scopes?: string[];
  endpoints?: ScopeEndpoint[];
}

export interface RoleDefinition {
  id: string;
  name: string;
  description?: string;
  isSystem: boolean;
  scopes: string[];
  accountCount?: number;
}

export interface CreateRoleInput {
  id: string;
  name: string;
  description?: string;
  scopes: string[];
}

export interface UpdateRoleInput {
  name?: string;
  description?: string;
}

export interface CreateAdminInput {
  username: string;
  gmail: string;
  password: string;
  fullName: string;
  isActive: boolean;
  roleId: string;
  product?: DashboardProduct;
  /** @deprecated use roleId */
  role?: string;
}

export interface UpdateAdminInput {
  username?: string;
  gmail?: string;
  fullName?: string;
  password?: string;
  isActive?: boolean;
  roleId?: string;
  /** @deprecated use roleId */
  role?: string;
}
