import { User, CompanyTenant, KatiChatMessage, TenantAnalytics, EmployeeOnboardingProgress, SystemAuditLog } from '../types';

export async function loginUser(email: string): Promise<{ user: User; tenant: CompanyTenant | null; redirectUrl: string }> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Login failed');
  return data;
}

export async function fetchTenants(): Promise<CompanyTenant[]> {
  const res = await fetch('/api/tenants');
  const data = await res.json();
  return data.tenants || [];
}

export async function fetchTenantById(tenantId: string): Promise<CompanyTenant> {
  const res = await fetch(`/api/tenants/${tenantId}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch tenant');
  return data.tenant;
}

export async function createTenant(payload: Partial<CompanyTenant>): Promise<CompanyTenant> {
  const res = await fetch('/api/tenants', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to create tenant');
  return data.tenant;
}

export async function updateTenant(tenantId: string, payload: Partial<CompanyTenant> & { actorEmail?: string; auditAction?: string }): Promise<CompanyTenant> {
  const res = await fetch(`/api/tenants/${tenantId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update tenant');
  return data.tenant;
}

export async function fetchAnalytics(tenantId: string): Promise<TenantAnalytics> {
  const res = await fetch(`/api/analytics/${tenantId}`);
  const data = await res.json();
  return data.analytics;
}

export async function fetchOnboardingProgress(tenantId: string): Promise<EmployeeOnboardingProgress[]> {
  const res = await fetch(`/api/onboarding/${tenantId}`);
  const data = await res.json();
  return data.onboarding || [];
}

export async function registerNewHire(
  tenantId: string,
  payload: {
    employeeName: string;
    email: string;
    department?: string;
    position?: string;
    startDate?: string;
    customTasks?: string[];
    actorEmail?: string;
  }
): Promise<{ onboarding: EmployeeOnboardingProgress[]; newHire: EmployeeOnboardingProgress }> {
  const res = await fetch(`/api/onboarding/${tenantId}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to register new hire');
  return data;
}

export async function toggleOnboardingTask(tenantId: string, employeeId: string, taskId: string, completed: boolean): Promise<EmployeeOnboardingProgress[]> {
  const res = await fetch(`/api/onboarding/${tenantId}/task-toggle`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ employeeId, taskId, completed }),
  });
  const data = await res.json();
  return data.onboarding || [];
}

export async function sendKatiChatMessage(
  tenantId: string,
  userQuery: string,
  userName?: string,
  userRole?: string
): Promise<KatiChatMessage> {
  const res = await fetch('/api/kati/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tenantId, userQuery, userName, userRole }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to get answer from Kati');
  return data.message;
}

export async function fetchAuditLogs(): Promise<SystemAuditLog[]> {
  const res = await fetch('/api/audit-logs');
  const data = await res.json();
  return data.logs || [];
}
