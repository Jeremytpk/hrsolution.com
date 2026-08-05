export type UserRole = 'super_admin' | 'company_admin' | 'employee';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyId?: string; // empty for super_admin
  companyName?: string;
  department?: string;
  title?: string;
  avatarUrl?: string;
  onboardingStatus?: 'pending' | 'in_progress' | 'completed';
  joinedDate?: string;
}

export interface CompanyPolicy {
  id: string;
  category: 'pto_leave' | 'benefits_health' | 'remote_work' | 'conduct_ethics' | 'compensation' | 'onboarding' | 'custom';
  title: string;
  content: string;
  lastUpdated: string;
  version: string;
  effectiveDate: string;
  tags: string[];
}

export interface OnboardingTask {
  id: string;
  title: string;
  description: string;
  category: 'documentation' | 'policy_ack' | 'equipment' | 'training' | 'kati_intro';
  requiredRole?: string;
  dueDays: number;
  completed: boolean;
  completedAt?: string;
  documentLink?: string;
  requiresSignature?: boolean;
}

export interface EmployeeOnboardingProgress {
  employeeId: string;
  employeeName: string;
  department: string;
  startDate: string;
  progressPercent: number;
  tasks: OnboardingTask[];
  assignedMentor?: string;
  katiWelcomeSent: boolean;
}

export interface KatiPersonaConfig {
  botName: string; // Default: Kati
  tone: 'empathetic' | 'professional' | 'direct' | 'casual';
  policyStrictness: 'strict' | 'flexible' | 'balanced';
  customGreeting: string;
  escalationEmail: string;
  allowedSelfServiceForms: string[];
}

export interface CompanyAdminPermissions {
  canEditPersonaAndTone: boolean;
  canEditCompanyInfo: boolean;
  canEditPolicies: boolean;
  canAddPolicy?: boolean;
  canDeletePolicies: boolean;
}

export interface CompanyTenant {
  id: string;
  name: string;
  domain: string; // e.g., acmecorp.com
  description?: string; // What the company does / core mission & operations
  industry?: string; // Company industry sector
  logoUrl?: string;
  plan: 'enterprise' | 'growth' | 'starter';
  employeeCount: number;
  createdAt: string;
  status: 'active' | 'onboarding' | 'suspended';
  policies: CompanyPolicy[];
  katiConfig: KatiPersonaConfig;
  adminPermissions?: CompanyAdminPermissions;
  isolatedEncryptionKeyId: string; // Visual proof of multi-tenant security isolation
}

export interface KatiChatMessage {
  id: string;
  sender: 'user' | 'kati';
  text: string;
  timestamp: string;
  policyCitations?: { policyTitle: string; section: string; relevanceSnippet: string }[];
  suggestedActions?: { label: string; actionType: 'form' | 'link' | 'escalate' | 'suggested_question'; value: string }[];
  confidenceScore?: number;
}

export interface TenantAnalytics {
  tenantId: string;
  totalQueriesThisMonth: number;
  autoResolutionRate: number; // percentage, e.g. 94.2%
  avgResponseTimeSec: number;
  employeeCsat: number; // out of 5.0
  onboardingCompletionRate: number; // percentage
  topQueries: { topic: string; count: number; category: string }[];
  queriesByDay: { day: string; resolvedByKati: number; escalatedToHR: number }[];
  policyGapAlerts: { policyTopic: string; queryCount: number; recommendedAction: string }[];
}

export interface SystemAuditLog {
  id: string;
  timestamp: string;
  tenantId: string;
  companyName: string;
  action: string;
  actorEmail: string;
  securityDomain: string;
}
