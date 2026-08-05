import React, { useState, useEffect } from 'react';
import { CompanyTenant, CompanyPolicy, TenantAnalytics, EmployeeOnboardingProgress, User } from '../types';
import { fetchAnalytics, fetchOnboardingProgress, updateTenant, registerNewHire, toggleOnboardingTask } from '../services/api';
import { AnalyticsCharts } from './AnalyticsCharts';
import { KatiChatWidget } from './KatiChatWidget';
import { useLanguage } from '../context/LanguageContext';
import {
  Building2,
  FileText,
  Sliders,
  LineChart,
  UserCheck,
  Plus,
  Save,
  Lock,
  Bot,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Edit,
  Trash2,
  Edit3,
  ShieldAlert,
  Copy,
  Check,
} from 'lucide-react';

interface CompanyAdminDashboardProps {
  tenant: CompanyTenant;
  currentUser: User;
  onUpdateTenantState: (updated: CompanyTenant) => void;
}

export const CompanyAdminDashboard: React.FC<CompanyAdminDashboardProps> = ({
  tenant,
  currentUser,
  onUpdateTenantState,
}) => {
  const { t } = useLanguage();
  const [activeSubTab, setActiveSubTab] = useState<'analytics' | 'policies' | 'persona' | 'onboarding' | 'playground'>('analytics');
  const [analytics, setAnalytics] = useState<TenantAnalytics | null>(null);
  const [onboardingList, setOnboardingList] = useState<EmployeeOnboardingProgress[]>([]);

  // Permission Flags
  const isSuperAdmin = currentUser.role === 'super_admin';
  const canEditPersonaAndTone = isSuperAdmin || (tenant.adminPermissions?.canEditPersonaAndTone ?? true);
  const canEditCompanyInfo = isSuperAdmin; // Company admin cannot edit company info
  const canEditPolicies = isSuperAdmin || (tenant.adminPermissions?.canEditPolicies ?? true);
  const canAddPolicy = isSuperAdmin || (tenant.adminPermissions?.canAddPolicy ?? tenant.adminPermissions?.canEditPolicies ?? true);
  const canDeletePolicies = isSuperAdmin || (tenant.adminPermissions?.canDeletePolicies ?? false);

  const [kmsCopied, setKmsCopied] = useState(false);

  const handleCopyKmsKey = () => {
    navigator.clipboard.writeText(tenant.isolatedEncryptionKeyId);
    setKmsCopied(true);
    setTimeout(() => setKmsCopied(false), 2000);
  };

  // Persona Edit State
  const [botName, setBotName] = useState(tenant.katiConfig.botName);
  const [tone, setTone] = useState(tenant.katiConfig.tone);
  const [policyStrictness, setPolicyStrictness] = useState(tenant.katiConfig.policyStrictness);
  const [customGreeting, setCustomGreeting] = useState(tenant.katiConfig.customGreeting);
  const [escalationEmail, setEscalationEmail] = useState(tenant.katiConfig.escalationEmail);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Company Info Edit State
  const [showEditCompanyModal, setShowEditCompanyModal] = useState(false);
  const [editCompanyName, setEditCompanyName] = useState(tenant.name);
  const [editCompanyDomain, setEditCompanyDomain] = useState(tenant.domain);
  const [editCompanyIndustry, setEditCompanyIndustry] = useState(tenant.industry || 'Enterprise Business & Operations');
  const [editCompanyDescription, setEditCompanyDescription] = useState(
    tenant.description || `${tenant.name} provides enterprise products and specialized industry services for client operations.`
  );
  const [editCompanyPlan, setEditCompanyPlan] = useState(tenant.plan);
  const [editEmployeeCount, setEditEmployeeCount] = useState(tenant.employeeCount);

  // Sync state when tenant changes
  useEffect(() => {
    setBotName(tenant.katiConfig.botName);
    setTone(tenant.katiConfig.tone);
    setPolicyStrictness(tenant.katiConfig.policyStrictness);
    setCustomGreeting(tenant.katiConfig.customGreeting);
    setEscalationEmail(tenant.katiConfig.escalationEmail);
    setEditCompanyName(tenant.name);
    setEditCompanyDomain(tenant.domain);
    setEditCompanyIndustry(tenant.industry || 'Enterprise Business & Operations');
    setEditCompanyDescription(
      tenant.description || `${tenant.name} provides enterprise products and specialized industry services for client operations.`
    );
    setEditCompanyPlan(tenant.plan);
    setEditEmployeeCount(tenant.employeeCount);
  }, [tenant]);

  // Register New Hire Form State
  const [showRegisterHireModal, setShowRegisterHireModal] = useState(false);
  const [newHireName, setNewHireName] = useState('');
  const [newHireEmail, setNewHireEmail] = useState('');
  const [newHireDepartment, setNewHireDepartment] = useState('Engineering');
  const [newHirePosition, setNewHirePosition] = useState('');
  const [newHireStartDate, setNewHireStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  // New Policy Form State
  const [showAddPolicy, setShowAddPolicy] = useState(false);
  const [newPolicyTitle, setNewPolicyTitle] = useState('');
  const [newPolicyCategory, setNewPolicyCategory] = useState<CompanyPolicy['category']>('pto_leave');
  const [newPolicyContent, setNewPolicyContent] = useState('');

  // Edit Policy Modal State
  const [editingPolicy, setEditingPolicy] = useState<CompanyPolicy | null>(null);
  const [editPolicyTitle, setEditPolicyTitle] = useState('');
  const [editPolicyCategory, setEditPolicyCategory] = useState<CompanyPolicy['category']>('pto_leave');
  const [editPolicyContent, setEditPolicyContent] = useState('');
  const [editPolicyVersion, setEditPolicyVersion] = useState('');

  useEffect(() => {
    fetchAnalytics(tenant.id).then(setAnalytics);
    fetchOnboardingProgress(tenant.id).then(setOnboardingList);
    if (!isSuperAdmin && activeSubTab === 'persona') {
      setActiveSubTab('analytics');
    }
  }, [tenant.id, isSuperAdmin, activeSubTab]);

  const handleSaveCompanyInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEditCompanyInfo) return;
    const updated = await updateTenant(tenant.id, {
      name: editCompanyName,
      domain: editCompanyDomain,
      industry: editCompanyIndustry,
      description: editCompanyDescription,
      plan: editCompanyPlan,
      employeeCount: editEmployeeCount,
      actorEmail: currentUser.email,
      auditAction: `COMPANY_INFO_UPDATED (${editCompanyName})`,
    });
    onUpdateTenantState(updated);
    setShowEditCompanyModal(false);
  };

  const handleRegisterHireSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHireName || !newHireEmail) return;

    try {
      const res = await registerNewHire(tenant.id, {
        employeeName: newHireName,
        email: newHireEmail,
        department: newHireDepartment,
        position: newHirePosition,
        startDate: newHireStartDate,
        actorEmail: currentUser.email,
      });

      setOnboardingList(res.onboarding);

      // Update tenant employee count in parent state
      onUpdateTenantState({
        ...tenant,
        employeeCount: tenant.employeeCount + 1,
      });

      setRegisterSuccess(true);
      setTimeout(() => {
        setRegisterSuccess(false);
        setShowRegisterHireModal(false);
        setNewHireName('');
        setNewHireEmail('');
        setNewHirePosition('');
      }, 1200);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleTask = async (employeeId: string, taskId: string, currentStatus: boolean) => {
    const updatedList = await toggleOnboardingTask(tenant.id, employeeId, taskId, !currentStatus);
    setOnboardingList(updatedList);
  };

  const handleSavePersona = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEditPersonaAndTone) return;
    const updatedKatiConfig = {
      ...tenant.katiConfig,
      botName,
      tone,
      policyStrictness,
      customGreeting,
      escalationEmail,
    };
    const updated = await updateTenant(tenant.id, {
      katiConfig: updatedKatiConfig,
      actorEmail: currentUser.email,
      auditAction: `KATI_PERSONA_TUNED (${botName})`,
    });
    onUpdateTenantState(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleOpenEditPolicy = (policy: CompanyPolicy) => {
    setEditingPolicy(policy);
    setEditPolicyTitle(policy.title);
    setEditPolicyCategory(policy.category);
    setEditPolicyContent(policy.content);
    setEditPolicyVersion(policy.version);
  };

  const handleSavePolicyEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPolicy || !canEditPolicies) return;

    const updatedPolicies = tenant.policies.map((p) =>
      p.id === editingPolicy.id
        ? {
            ...p,
            title: editPolicyTitle,
            category: editPolicyCategory,
            content: editPolicyContent,
            version: editPolicyVersion,
            lastUpdated: new Date().toISOString().split('T')[0],
          }
        : p
    );

    const updated = await updateTenant(tenant.id, {
      policies: updatedPolicies,
      actorEmail: currentUser.email,
      auditAction: `POLICY_UPDATED: ${editPolicyTitle} (${editPolicyVersion})`,
    });
    onUpdateTenantState(updated);
    setEditingPolicy(null);
  };

  const handleDeletePolicy = async (policyId: string, title: string) => {
    if (!canDeletePolicies) return;
    if (!confirm(`Are you sure you want to delete the policy document "${title}"? This cannot be undone.`)) return;

    const updatedPolicies = tenant.policies.filter((p) => p.id !== policyId);
    const updated = await updateTenant(tenant.id, {
      policies: updatedPolicies,
      actorEmail: currentUser.email,
      auditAction: `POLICY_DELETED: ${title}`,
    });
    onUpdateTenantState(updated);
  };

  const handleAddPolicySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPolicyTitle || !newPolicyContent) return;
    const newDoc: CompanyPolicy = {
      id: `pol-${tenant.id}-${Date.now()}`,
      category: newPolicyCategory,
      title: newPolicyTitle,
      content: newPolicyContent,
      lastUpdated: new Date().toISOString().split('T')[0],
      version: 'v1.0',
      effectiveDate: new Date().toISOString().split('T')[0],
      tags: [newPolicyCategory, 'Custom'],
    };
    const updatedPolicies = [...tenant.policies, newDoc];
    const updated = await updateTenant(tenant.id, {
      policies: updatedPolicies,
      actorEmail: currentUser.email,
      auditAction: `POLICY_ADDED: ${newPolicyTitle}`,
    });
    onUpdateTenantState(updated);
    setShowAddPolicy(false);
    setNewPolicyTitle('');
    setNewPolicyContent('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Admin Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-white">{tenant.name} HR Admin Dashboard</h1>
                <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full">
                  Tenant ID: {tenant.id}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Head of HR: {currentUser.name} ({currentUser.email}) &bull; Domain: {tenant.domain} &bull; Employees: {tenant.employeeCount}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
          {canEditCompanyInfo && (
            <button
              onClick={() => {
                setEditCompanyName(tenant.name);
                setEditCompanyDomain(tenant.domain);
                setEditCompanyPlan(tenant.plan);
                setEditEmployeeCount(tenant.employeeCount);
                setShowEditCompanyModal(true);
              }}
              title={t('company.editInfo', 'Edit Company Info')}
              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-all shadow-md shrink-0"
            >
              <Edit3 className="w-3.5 h-3.5 shrink-0" />
              <span>{t('company.editInfo', 'Edit Company Info')}</span>
            </button>
          )}

          {/* Security Verification & KMS Key Reader Card */}
          <div className="bg-slate-950 border border-emerald-500/30 p-2.5 sm:p-3 rounded-xl flex flex-wrap sm:flex-nowrap items-center gap-2 text-xs w-full sm:w-auto">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <div className="space-y-0.5 flex-1 min-w-0">
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block truncate">
                Verification KMS Key:
              </span>
              <div className="flex items-center space-x-2">
                <code className="font-mono text-emerald-400 font-bold text-xs select-all bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800 truncate max-w-[140px] sm:max-w-none">
                  {tenant.isolatedEncryptionKeyId}
                </code>
                <button
                  type="button"
                  onClick={handleCopyKmsKey}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold rounded flex items-center space-x-1 transition-all shrink-0"
                  title="Copy KMS Key for Verification"
                >
                  {kmsCopied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400 hidden sm:inline">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-indigo-300" />
                      <span className="hidden sm:inline">Copy Key</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Company Details & Description Read-Only Overview Banner */}
      <div className="bg-slate-900 border border-slate-800 p-3.5 sm:p-5 rounded-2xl shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2 flex-wrap gap-1">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Company Profile Details</span>
            <span className="px-2.5 py-0.5 text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700 rounded-md">
              Industry: {tenant.industry || 'Enterprise Business & Operations'}
            </span>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3 text-xs text-slate-400 flex-wrap">
            <span>Domain: <strong className="text-emerald-400 font-mono">{tenant.domain}</strong></span>
            <span className="hidden sm:inline">&bull;</span>
            <span>Plan: <strong className="text-purple-300 uppercase font-bold">{tenant.plan}</strong></span>
            <span className="hidden sm:inline">&bull;</span>
            <span>Workforce: <strong className="text-slate-200 font-bold">{tenant.employeeCount} Users</strong></span>
          </div>
        </div>

        <div className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 space-y-1">
          <span className="text-slate-400 font-bold text-[11px] block uppercase tracking-wider">
            Company Operations & Description:
          </span>
          <p>{tenant.description || `${tenant.name} operates enterprise services and workforce platforms for client operations.`}</p>
        </div>

        {/* KMS Identity Note */}
        <div className="p-3 bg-indigo-950/40 border border-indigo-800/50 rounded-xl text-[11px] text-indigo-300 flex items-start space-x-2">
          <ShieldAlert className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <p>
            <strong>Identity Verification Note:</strong> When requesting updates to company info, billing tiers, or high-level policy resets from Super Admin support, present your full KMS Key (<code className="font-mono text-emerald-300 bg-slate-900 px-1 rounded truncate max-w-[120px] inline-block align-bottom">{tenant.isolatedEncryptionKeyId}</code>) to verify authority.
          </p>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 overflow-x-auto scrollbar-none py-1">
        <button
          onClick={() => setActiveSubTab('analytics')}
          className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 ${
            activeSubTab === 'analytics'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <LineChart className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Real-Time Analytics</span>
        </button>

        <button
          onClick={() => setActiveSubTab('policies')}
          className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 ${
            activeSubTab === 'policies'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <FileText className="w-4 h-4 text-purple-400 shrink-0" />
          <span>Policy Documents ({tenant.policies.length})</span>
        </button>

        {isSuperAdmin && (
          <button
            onClick={() => setActiveSubTab('persona')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 ${
              activeSubTab === 'persona'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Sliders className="w-4 h-4 text-pink-400 shrink-0" />
            <span>Kati AI Persona & Tone</span>
          </button>
        )}

        <button
          onClick={() => setActiveSubTab('onboarding')}
          className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 ${
            activeSubTab === 'onboarding'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <UserCheck className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>Onboarding Module ({onboardingList.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('playground')}
          className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 ${
            activeSubTab === 'playground'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4 text-yellow-400 shrink-0" />
          <span>AI Policy Playground</span>
        </button>
      </div>

      {/* Sub-Tab Content */}
      {activeSubTab === 'analytics' && analytics && (
        <AnalyticsCharts analytics={analytics} title={`${tenant.name} AI HR Performance`} />
      )}

      {activeSubTab === 'policies' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <div>
              <h2 className="text-base font-bold text-white">Company Policy Base for Kati RAG Engine</h2>
              <p className="text-xs text-slate-400">
                Kati AI HR indexes these documents strictly to answer employee questions at {tenant.name}.
              </p>
            </div>
            {canAddPolicy && (
              <button
                onClick={() => setShowAddPolicy(true)}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center space-x-1.5 shadow-md transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>{t('company.addPolicyBtn', '+ Add Policy Document')}</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tenant.policies.map((p) => (
              <div key={p.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-300">{p.title}</span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/60">
                      {p.version}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-850">
                    {p.content}
                  </p>
                </div>

                <div className="space-y-2.5 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Category: {p.category}</span>
                    <span>Last Updated: {p.lastUpdated}</span>
                  </div>

                  {/* Policy Edit and Delete Buttons according to permissions */}
                  <div className="flex items-center justify-end space-x-2 pt-1 border-t border-slate-850">
                    {canEditPolicies ? (
                      <button
                        onClick={() => handleOpenEditPolicy(p)}
                        className="px-2.5 py-1.5 bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-700/60 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit Policy</span>
                      </button>
                    ) : null}

                    {canDeletePolicies ? (
                      <button
                        onClick={() => handleDeletePolicy(p.id, p.title)}
                        className="px-2.5 py-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800/60 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Policy</span>
                      </button>
                    ) : null}

                    {!canEditPolicies && !canDeletePolicies && (
                      <span className="text-[10px] text-slate-500 italic flex items-center space-x-1">
                        <Lock className="w-3 h-3 text-amber-500/80" />
                        <span>Edit & Delete Restricted by Admin</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Edit Policy Modal */}
          {editingPolicy && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <Edit3 className="w-4 h-4 text-indigo-400" />
                    <span>Edit Policy Document: {editingPolicy.title}</span>
                  </h3>
                  <button onClick={() => setEditingPolicy(null)} className="text-slate-400 text-xs">✕</button>
                </div>

                <form onSubmit={handleSavePolicyEdit} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Policy Title</label>
                    <input
                      type="text"
                      required
                      value={editPolicyTitle}
                      onChange={(e) => setEditPolicyTitle(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Category</label>
                      <select
                        value={editPolicyCategory}
                        onChange={(e) => setEditPolicyCategory(e.target.value as any)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                      >
                        <option value="pto_leave">PTO & Paid Leave</option>
                        <option value="benefits_health">Benefits & Health Insurance</option>
                        <option value="remote_work">Remote Work & Equipment</option>
                        <option value="conduct_ethics">Code of Conduct & Ethics</option>
                        <option value="compensation">Compensation & Overtime</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Version tag</label>
                      <input
                        type="text"
                        value={editPolicyVersion}
                        onChange={(e) => setEditPolicyVersion(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Policy Content</label>
                    <textarea
                      rows={5}
                      required
                      value={editPolicyContent}
                      onChange={(e) => setEditPolicyContent(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white"
                    />
                  </div>

                  <div className="flex items-center justify-end space-x-2 border-t border-slate-800 pt-3">
                    <button
                      type="button"
                      onClick={() => setEditingPolicy(null)}
                      className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow-md flex items-center space-x-1"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Add Policy Document Modal */}
          {showAddPolicy && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <Plus className="w-4 h-4 text-indigo-400" />
                    <span>{t('company.addPolicyTitle', 'Add New Policy Document')}</span>
                  </h3>
                  <button onClick={() => setShowAddPolicy(false)} className="text-slate-400 text-xs hover:text-white">✕</button>
                </div>

                <form onSubmit={handleAddPolicySubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">{t('company.policyTitle', 'Policy Title')} *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Remote Work & Equipment Policy 2026"
                      value={newPolicyTitle}
                      onChange={(e) => setNewPolicyTitle(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">{t('company.policyCategory', 'Category')}</label>
                    <select
                      value={newPolicyCategory}
                      onChange={(e) => setNewPolicyCategory(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="pto_leave">PTO & Paid Leave</option>
                      <option value="benefits_health">Benefits & Health Insurance</option>
                      <option value="remote_work">Remote Work & Equipment</option>
                      <option value="conduct_ethics">Code of Conduct & Ethics</option>
                      <option value="compensation">Compensation & Overtime</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">{t('company.policyContent', 'Policy Content')} *</label>
                    <textarea
                      rows={5}
                      required
                      placeholder="Enter detailed policy text, guidelines, eligibility requirements, or procedures..."
                      value={newPolicyContent}
                      onChange={(e) => setNewPolicyContent(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="flex items-center justify-end space-x-2 border-t border-slate-800 pt-3">
                    <button
                      type="button"
                      onClick={() => setShowAddPolicy(false)}
                      className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-semibold hover:bg-slate-700 transition-all"
                    >
                      {t('common.cancel', 'Cancel')}
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow-md flex items-center space-x-1.5 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{t('company.addPolicyBtn', '+ Add Policy Document')}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'persona' && isSuperAdmin && (
        <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Sliders className="w-5 h-5 text-indigo-400" />
              <span>Configure Kati AI HR Persona & Escalations</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Customize how Kati speaks, greets employees, and handles HR escalation emails at {tenant.name}.
            </p>
          </div>

          {!canEditPersonaAndTone && (
            <div className="p-4 bg-amber-950/40 border border-amber-800/60 rounded-xl text-amber-200 text-xs flex items-start space-x-3">
              <Lock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-300">Access Restricted by Super Admin</p>
                <p className="text-amber-300/80 mt-0.5 leading-relaxed">
                  Only platform super admins can modify Kati AI persona, tone, and system greeting settings. Contact super admin at <strong>admin@hrsolution.com</strong> to request permission access.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSavePersona} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">AI HR Bot Display Name</label>
              <input
                type="text"
                disabled={!canEditPersonaAndTone}
                value={botName}
                onChange={(e) => setBotName(e.target.value)}
                className={`w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white ${
                  !canEditPersonaAndTone ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Conversational Tone</label>
                <select
                  disabled={!canEditPersonaAndTone}
                  value={tone}
                  onChange={(e) => setTone(e.target.value as any)}
                  className={`w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white ${
                    !canEditPersonaAndTone ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <option value="empathetic">Empathetic & Warm</option>
                  <option value="professional">Professional & Direct</option>
                  <option value="strict">Strict Compliance</option>
                  <option value="casual">Casual & Modern</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Policy Strictness Level</label>
                <select
                  disabled={!canEditPersonaAndTone}
                  value={policyStrictness}
                  onChange={(e) => setPolicyStrictness(e.target.value as any)}
                  className={`w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white ${
                    !canEditPersonaAndTone ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <option value="balanced">Balanced (Standard RAG)</option>
                  <option value="strict">Strict (Literal Citations Only)</option>
                  <option value="flexible">Flexible Guidance</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Custom Employee Welcome Greeting</label>
              <textarea
                rows={3}
                disabled={!canEditPersonaAndTone}
                value={customGreeting}
                onChange={(e) => setCustomGreeting(e.target.value)}
                className={`w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white ${
                  !canEditPersonaAndTone ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">HR Escalation Contact Email</label>
              <input
                type="email"
                disabled={!canEditPersonaAndTone}
                value={escalationEmail}
                onChange={(e) => setEscalationEmail(e.target.value)}
                className={`w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white ${
                  !canEditPersonaAndTone ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              />
            </div>

            {savedSuccess && (
              <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded-xl flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Kati AI Persona & Escalations updated successfully!</span>
              </div>
            )}

            <button
              type="submit"
              disabled={!canEditPersonaAndTone}
              className={`w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all shadow-md flex items-center justify-center space-x-1.5 ${
                !canEditPersonaAndTone ? 'opacity-40 cursor-not-allowed bg-slate-800 hover:bg-slate-800' : ''
              }`}
            >
              <Save className="w-4 h-4" />
              <span>Save AI HR Persona Configurations</span>
            </button>
          </form>
        </div>
      )}

      {activeSubTab === 'onboarding' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <UserCheck className="w-5 h-5 text-indigo-400" />
                <span>Automated Employee Onboarding Module</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Register new hired employees and track automated AI HR onboarding checklists for {tenant.name}.
              </p>
            </div>
            <button
              onClick={() => setShowRegisterHireModal(true)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-md flex items-center space-x-2 shrink-0 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Register New Hire</span>
            </button>
          </div>

          <div className="space-y-4">
            {onboardingList.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center space-y-3">
                <UserCheck className="w-10 h-10 text-slate-600 mx-auto" />
                <p className="text-sm font-semibold text-slate-300">No new hires registered yet</p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Click &apos;Register New Hire&apos; above to onboard a new employee and generate their automated Kati AI onboarding portal account.
                </p>
                <button
                  onClick={() => setShowRegisterHireModal(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl inline-flex items-center space-x-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Register First New Hire</span>
                </button>
              </div>
            ) : (
              onboardingList.map((emp) => (
                <div key={emp.employeeId} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-white">{emp.employeeName}</span>
                        <span className="text-[10px] font-mono bg-indigo-950 text-indigo-300 border border-indigo-800 px-2 py-0.5 rounded-md">
                          ID: {emp.employeeId}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Department: <strong className="text-slate-300">{emp.department}</strong> &bull; Start Date: <strong className="text-slate-300">{emp.startDate}</strong>
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                      <span className="text-xs text-slate-400 font-medium">Onboarding Progress:</span>
                      <span className="text-sm font-black text-emerald-400">{emp.progressPercent}%</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-400">Onboarding Tasks Checklist:</span>
                      <span className="text-[10px] text-slate-500">Click task to toggle completion state</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {emp.tasks.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => handleToggleTask(emp.employeeId, t.id, t.completed)}
                          className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                            t.completed
                              ? 'bg-emerald-950/20 border-emerald-900/60 text-slate-300 hover:border-emerald-700'
                              : 'bg-slate-950 border-slate-800 text-slate-200 hover:border-slate-700'
                          }`}
                        >
                          <span className={`truncate max-w-[200px] ${t.completed ? 'line-through text-slate-400' : ''}`}>
                            {t.title}
                          </span>
                          {t.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                          ) : (
                            <span className="text-[10px] text-amber-400 font-mono bg-amber-950/50 px-2 py-0.5 rounded border border-amber-800/60 shrink-0 ml-2">
                              Pending
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Register New Hire Modal */}
          {showRegisterHireModal && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <UserCheck className="w-5 h-5 text-indigo-400" />
                    <span>Register New Hired Employee & Onboarding</span>
                  </h3>
                  <button onClick={() => setShowRegisterHireModal(false)} className="text-slate-400 text-xs hover:text-white">✕</button>
                </div>

                <form onSubmit={handleRegisterHireSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Employee Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sophia Martinez"
                      value={newHireName}
                      onChange={(e) => setNewHireName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Company Work Email *</label>
                    <input
                      type="email"
                      required
                      placeholder={`e.g. sophia.martinez@${tenant.domain || 'company.com'}`}
                      value={newHireEmail}
                      onChange={(e) => setNewHireEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Department</label>
                      <select
                        value={newHireDepartment}
                        onChange={(e) => setNewHireDepartment(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                      >
                        <option value="Engineering">Engineering</option>
                        <option value="Sales & Business Dev">Sales & Business Dev</option>
                        <option value="Human Resources">Human Resources</option>
                        <option value="Product & Design">Product & Design</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Operations & Legal">Operations & Legal</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Position / Job Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Senior Software Engineer"
                        value={newHirePosition}
                        onChange={(e) => setNewHirePosition(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Official Start Date</label>
                    <input
                      type="date"
                      required
                      value={newHireStartDate}
                      onChange={(e) => setNewHireStartDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="p-3 bg-indigo-950/40 border border-indigo-800/60 rounded-xl text-[11px] text-indigo-300 leading-relaxed">
                    <strong>Automated AI Onboarding Provisioning:</strong> Registering this new hire automatically creates their employee portal credentials, populates their policy checklist, and connects them with Kati AI HR assistant.
                  </div>

                  {registerSuccess && (
                    <div className="p-3 bg-emerald-950 border border-emerald-800 text-emerald-300 rounded-xl flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>New hire {newHireName} successfully registered!</span>
                    </div>
                  )}

                  <div className="flex items-center justify-end space-x-2 border-t border-slate-800 pt-3">
                    <button
                      type="button"
                      onClick={() => setShowRegisterHireModal(false)}
                      className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-semibold hover:bg-slate-700 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow-md flex items-center space-x-1.5 transition-all"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Confirm & Register Employee</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'playground' && (
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <span>Interactive Kati AI HR Policy Testing Playground</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Test how Kati evaluates employee questions using {tenant.name}&apos;s isolated policy database before publishing policy updates.
            </p>
          </div>

          <KatiChatWidget tenant={tenant} currentUser={currentUser} />
        </div>
      )}

      {/* Edit Company Info Modal */}
      {showEditCompanyModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-indigo-400" />
                <span>Edit Company Profile & Information</span>
              </h3>
              <button onClick={() => setShowEditCompanyModal(false)} className="text-slate-400 text-xs">✕</button>
            </div>

            <form onSubmit={handleSaveCompanyInfo} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  value={editCompanyName}
                  onChange={(e) => setEditCompanyName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Industry / Domain Sector</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Enterprise Software & AI Technology"
                  value={editCompanyIndustry}
                  onChange={(e) => setEditCompanyIndustry(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Company Description (What the company does / core job)</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe what the company does, its mission, core services or products..."
                  value={editCompanyDescription}
                  onChange={(e) => setEditCompanyDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Company Domain</label>
                  <input
                    type="text"
                    required
                    value={editCompanyDomain}
                    onChange={(e) => setEditCompanyDomain(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Employee Count</label>
                  <input
                    type="number"
                    required
                    value={editEmployeeCount}
                    onChange={(e) => setEditEmployeeCount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Subscription Plan</label>
                <select
                  value={editCompanyPlan}
                  onChange={(e) => setEditCompanyPlan(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="enterprise">Enterprise (Unlimited Policies & KMS)</option>
                  <option value="growth">Growth Plan</option>
                  <option value="starter">Starter Plan</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-2 border-t border-slate-800 pt-3">
                <button
                  type="button"
                  onClick={() => setShowEditCompanyModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow-md flex items-center space-x-1"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Update Company Info</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
