import React, { useState, useEffect } from 'react';
import { CompanyTenant, User, SystemAuditLog, TenantAnalytics } from '../types';
import { updateTenant, fetchAnalytics, fetchAuditLogs, createTenant } from '../services/api';
import { AnalyticsCharts } from './AnalyticsCharts';
import { useLanguage } from '../context/LanguageContext';
import {
  ShieldCheck,
  Building2,
  Users,
  Lock,
  Database,
  Sliders,
  LineChart,
  Terminal,
  Plus,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Cpu,
  Key,
  Edit3,
  Edit,
  Trash2,
  Shield,
  Check,
  X,
  Bot,
  AlertTriangle,
  Save,
  ArrowRight,
  Search,
  LayoutGrid,
  List,
  ArrowLeft,
  ExternalLink,
  FileText,
  History,
} from 'lucide-react';

interface SuperAdminDashboardProps {
  tenants: CompanyTenant[];
  currentUser: User;
  onTenantCreated: (newTenant: CompanyTenant) => void;
  onTenantUpdated?: (updatedTenant: CompanyTenant) => void;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({
  tenants,
  currentUser,
  onTenantCreated,
  onTenantUpdated,
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'tenants' | 'security' | 'analytics' | 'prompt_engine'>('tenants');
  const [globalAnalytics, setGlobalAnalytics] = useState<TenantAnalytics | null>(null);
  const [auditLogs, setAuditLogs] = useState<SystemAuditLog[]>([]);
  const [showProvisionModal, setShowProvisionModal] = useState(false);

  // Client Tenants Search & View Mode
  const [tenantViewMode, setTenantViewMode] = useState<'grid' | 'list'>('grid');
  const [tenantSearchQuery, setTenantSearchQuery] = useState('');

  // Selected Company Detail View State
  const [selectedCompanyDetail, setSelectedCompanyDetail] = useState<CompanyTenant | null>(null);
  const [selectedCompanyDetailSubTab, setSelectedCompanyDetailSubTab] = useState<'overview' | 'persona' | 'permissions' | 'policies' | 'history'>('overview');

  // Policy Management State in Detail Page
  const [detailShowAddPolicyModal, setDetailShowAddPolicyModal] = useState(false);
  const [detailNewPolicyTitle, setDetailNewPolicyTitle] = useState('');
  const [detailNewPolicyCategory, setDetailNewPolicyCategory] = useState<CompanyTenant['policies'][0]['category']>('pto_leave');
  const [detailNewPolicyContent, setDetailNewPolicyContent] = useState('');

  const [detailEditingPolicy, setDetailEditingPolicy] = useState<CompanyTenant['policies'][0] | null>(null);
  const [detailEditPolicyTitle, setDetailEditPolicyTitle] = useState('');
  const [detailEditPolicyCategory, setDetailEditPolicyCategory] = useState<CompanyTenant['policies'][0]['category']>('pto_leave');
  const [detailEditPolicyContent, setDetailEditPolicyContent] = useState('');
  const [detailEditPolicyVersion, setDetailEditPolicyVersion] = useState('');

  // Tenant Selected for Permission Control Modal
  const [selectedTenantForPermissions, setSelectedTenantForPermissions] = useState<CompanyTenant | null>(null);
  const [permPersona, setPermPersona] = useState(false);
  const [permCompanyInfo, setPermCompanyInfo] = useState(false);
  const [permEditPolicy, setPermEditPolicy] = useState(false);
  const [permAddPolicy, setPermAddPolicy] = useState(true);
  const [permDeletePolicy, setPermDeletePolicy] = useState(false);
  const [permSavedSuccess, setPermSavedSuccess] = useState(false);

  // Super Admin: View & Edit Kati AI Persona State
  const [selectedTenantForPersona, setSelectedTenantForPersona] = useState<CompanyTenant | null>(null);
  const [personaBotName, setPersonaBotName] = useState('');
  const [personaTone, setPersonaTone] = useState<CompanyTenant['katiConfig']['tone']>('empathetic');
  const [personaStrictness, setPersonaStrictness] = useState<CompanyTenant['katiConfig']['policyStrictness']>('balanced');
  const [personaGreeting, setPersonaGreeting] = useState('');
  const [personaEscalationEmail, setPersonaEscalationEmail] = useState('');
  const [personaSavedSuccess, setPersonaSavedSuccess] = useState(false);

  // Super Admin: Edit Company Basic Information State (with Confirmation Step)
  const [selectedTenantForBasicInfo, setSelectedTenantForBasicInfo] = useState<CompanyTenant | null>(null);
  const [basicName, setBasicName] = useState('');
  const [basicDomain, setBasicDomain] = useState('');
  const [basicIndustry, setBasicIndustry] = useState('');
  const [basicDescription, setBasicDescription] = useState('');
  const [basicPlan, setBasicPlan] = useState<'enterprise' | 'growth' | 'starter'>('enterprise');
  const [basicEmployeeCount, setBasicEmployeeCount] = useState(100);
  const [basicStatus, setBasicStatus] = useState<'active' | 'suspended' | 'provisioning'>('active');
  const [showBasicInfoConfirmStep, setShowBasicInfoConfirmStep] = useState(false);
  const [basicInfoSavedSuccess, setBasicInfoSavedSuccess] = useState(false);

  const handleOpenPersonaModal = (t: CompanyTenant) => {
    setSelectedTenantForPersona(t);
    setPersonaBotName(t.katiConfig.botName);
    setPersonaTone(t.katiConfig.tone);
    setPersonaStrictness(t.katiConfig.policyStrictness);
    setPersonaGreeting(t.katiConfig.customGreeting);
    setPersonaEscalationEmail(t.katiConfig.escalationEmail);
  };

  const handleSaveTenantPersonaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenantForPersona) return;

    const updatedKatiConfig = {
      ...selectedTenantForPersona.katiConfig,
      botName: personaBotName,
      tone: personaTone,
      policyStrictness: personaStrictness,
      customGreeting: personaGreeting,
      escalationEmail: personaEscalationEmail,
    };

    const updated = await updateTenant(selectedTenantForPersona.id, {
      katiConfig: updatedKatiConfig,
      actorEmail: currentUser.email,
      auditAction: `KATI_PERSONA_TUNED (${personaBotName})`,
    });

    if (onTenantUpdated) {
      onTenantUpdated(updated);
    }

    if (selectedCompanyDetail && selectedCompanyDetail.id === updated.id) {
      setSelectedCompanyDetail(updated);
    }

    fetchAuditLogs().then(setAuditLogs);

    setPersonaSavedSuccess(true);
    setTimeout(() => {
      setPersonaSavedSuccess(false);
      setSelectedTenantForPersona(null);
    }, 1500);
  };

  const handleOpenBasicInfoModal = (t: CompanyTenant) => {
    setSelectedTenantForBasicInfo(t);
    setBasicName(t.name);
    setBasicDomain(t.domain);
    setBasicIndustry(t.industry || 'Enterprise Business & Operations');
    setBasicDescription(
      t.description || `${t.name} operates enterprise services and workforce management platforms for clients globally.`
    );
    setBasicPlan(t.plan);
    setBasicEmployeeCount(t.employeeCount);
    setBasicStatus(t.status);
    setShowBasicInfoConfirmStep(false);
  };

  const handlePrepareBasicInfoConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!basicName || !basicDomain) return;
    setShowBasicInfoConfirmStep(true);
  };

  const handleConfirmAndSaveBasicInfo = async () => {
    if (!selectedTenantForBasicInfo) return;

    const updated = await updateTenant(selectedTenantForBasicInfo.id, {
      name: basicName,
      domain: basicDomain,
      industry: basicIndustry,
      description: basicDescription,
      plan: basicPlan,
      employeeCount: basicEmployeeCount,
      status: basicStatus,
      actorEmail: currentUser.email,
      auditAction: `COMPANY_INFO_UPDATED (${basicName})`,
    });

    if (onTenantUpdated) {
      onTenantUpdated(updated);
    }

    if (selectedCompanyDetail && selectedCompanyDetail.id === updated.id) {
      setSelectedCompanyDetail(updated);
    }

    fetchAuditLogs().then(setAuditLogs);

    setBasicInfoSavedSuccess(true);
    setTimeout(() => {
      setBasicInfoSavedSuccess(false);
      setShowBasicInfoConfirmStep(false);
      setSelectedTenantForBasicInfo(null);
    }, 1500);
  };

  const handleOpenPermissionsModal = (t: CompanyTenant) => {
    setSelectedTenantForPermissions(t);
    setPermPersona(t.adminPermissions?.canEditPersonaAndTone ?? true);
    setPermCompanyInfo(t.adminPermissions?.canEditCompanyInfo ?? true);
    setPermEditPolicy(t.adminPermissions?.canEditPolicies ?? true);
    setPermAddPolicy(t.adminPermissions?.canAddPolicy ?? true);
    setPermDeletePolicy(t.adminPermissions?.canDeletePolicies ?? false);
  };

  const handleSavePermissionsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenantForPermissions) return;

    const updatedPermissions = {
      canEditPersonaAndTone: permPersona,
      canEditCompanyInfo: permCompanyInfo,
      canEditPolicies: permEditPolicy,
      canAddPolicy: permAddPolicy,
      canDeletePolicies: permDeletePolicy,
    };

    const updated = await updateTenant(selectedTenantForPermissions.id, {
      adminPermissions: updatedPermissions,
      actorEmail: currentUser.email,
      auditAction: `COMPANY_ADMIN_PERMISSIONS_UPDATED (${selectedTenantForPermissions.name})`,
    });

    if (onTenantUpdated) {
      onTenantUpdated(updated);
    }

    if (selectedCompanyDetail && selectedCompanyDetail.id === updated.id) {
      setSelectedCompanyDetail(updated);
    }

    fetchAuditLogs().then(setAuditLogs);

    setPermSavedSuccess(true);
    setTimeout(() => {
      setPermSavedSuccess(false);
      setSelectedTenantForPermissions(null);
    }, 1500);
  };

  // Detail Page Policy Handlers
  const handleDetailAddPolicySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompanyDetail || !detailNewPolicyTitle || !detailNewPolicyContent) return;

    const newDoc = {
      id: `pol-${selectedCompanyDetail.id}-${Date.now()}`,
      category: detailNewPolicyCategory,
      title: detailNewPolicyTitle,
      content: detailNewPolicyContent,
      lastUpdated: new Date().toISOString().split('T')[0],
      version: 'v1.0',
      effectiveDate: new Date().toISOString().split('T')[0],
      tags: [detailNewPolicyCategory, 'SuperAdminCustom'],
    };

    const updatedPolicies = [...selectedCompanyDetail.policies, newDoc];
    const updated = await updateTenant(selectedCompanyDetail.id, {
      policies: updatedPolicies,
      actorEmail: currentUser.email,
      auditAction: `POLICY_ADDED: ${detailNewPolicyTitle}`,
    });

    if (onTenantUpdated) onTenantUpdated(updated);
    setSelectedCompanyDetail(updated);
    setDetailShowAddPolicyModal(false);
    setDetailNewPolicyTitle('');
    setDetailNewPolicyContent('');
    fetchAuditLogs().then(setAuditLogs);
  };

  const handleDetailSavePolicyEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompanyDetail || !detailEditingPolicy) return;

    const updatedPolicies = selectedCompanyDetail.policies.map((p) =>
      p.id === detailEditingPolicy.id
        ? {
            ...p,
            title: detailEditPolicyTitle,
            category: detailEditPolicyCategory,
            content: detailEditPolicyContent,
            version: detailEditPolicyVersion,
            lastUpdated: new Date().toISOString().split('T')[0],
          }
        : p
    );

    const updated = await updateTenant(selectedCompanyDetail.id, {
      policies: updatedPolicies,
      actorEmail: currentUser.email,
      auditAction: `POLICY_UPDATED: ${detailEditPolicyTitle} (${detailEditPolicyVersion})`,
    });

    if (onTenantUpdated) onTenantUpdated(updated);
    setSelectedCompanyDetail(updated);
    setDetailEditingPolicy(null);
    fetchAuditLogs().then(setAuditLogs);
  };

  const handleDetailDeletePolicy = async (policyId: string, title: string) => {
    if (!selectedCompanyDetail) return;
    if (!confirm(`Are you sure you want to delete policy "${title}"? This action cannot be undone.`)) return;

    const updatedPolicies = selectedCompanyDetail.policies.filter((p) => p.id !== policyId);
    const updated = await updateTenant(selectedCompanyDetail.id, {
      policies: updatedPolicies,
      actorEmail: currentUser.email,
      auditAction: `POLICY_DELETED: ${title}`,
    });

    if (onTenantUpdated) onTenantUpdated(updated);
    setSelectedCompanyDetail(updated);
    fetchAuditLogs().then(setAuditLogs);
  };

  // New Tenant Provision Form State
  const [newCompName, setNewCompName] = useState('');
  const [newCompDomain, setNewCompDomain] = useState('');
  const [newCompPlan, setNewCompPlan] = useState<'enterprise' | 'growth' | 'starter'>('enterprise');
  const [newEmpCount, setNewEmpCount] = useState(250);

  useEffect(() => {
    fetchAnalytics('global').then(setGlobalAnalytics);
    fetchAuditLogs().then(setAuditLogs);
  }, []);

  const handleProvisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompName || !newCompDomain) return;

    const created = await createTenant({
      name: newCompName,
      domain: newCompDomain.toLowerCase(),
      plan: newCompPlan,
      employeeCount: newEmpCount,
    });

    onTenantCreated(created);
    setShowProvisionModal(false);
    setNewCompName('');
    setNewCompDomain('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Super Admin Top Header */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-950 border border-indigo-500/30 p-4 sm:p-6 rounded-2xl shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-lg shrink-0">
            <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-extrabold text-white">Central Kati Platform Portal</h1>
              <span className="px-2 py-0.5 text-[10px] sm:text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full">
                Platform Creators
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-1">
              Domain: <strong>hrsolution.com</strong> &bull; Managing {tenants.length} Client Tenants
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowProvisionModal(true)}
          title="Provision New Company Tenant"
          className="px-3.5 py-2 sm:px-4 sm:py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl transition-all shadow-md flex items-center space-x-1.5 shrink-0 justify-center w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span>Provision New Company Tenant</span>
        </button>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 overflow-x-auto scrollbar-none py-1">
        <button
          onClick={() => setActiveTab('tenants')}
          className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 ${
            activeTab === 'tenants'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>Client Tenants ({tenants.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 ${
            activeTab === 'security'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Multi-Tenant KMS Auditor</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 ${
            activeTab === 'analytics'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <LineChart className="w-4 h-4 text-purple-400 shrink-0" />
          <span>Global Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('prompt_engine')}
          className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 ${
            activeTab === 'prompt_engine'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Cpu className="w-4 h-4 text-pink-400 shrink-0" />
          <span>Kati AI System Engine</span>
        </button>
      </div>

      {/* Tab 1: Client Tenants Directory */}
      {activeTab === 'tenants' && (
        <div className="space-y-6">
          {/* If a company is selected for detailed view */}
          {selectedCompanyDetail ? (
            <div className="space-y-6 animate-fadeIn">
              {/* Back to Directory Bar */}
              <div className="flex items-center justify-between bg-slate-900 p-4 rounded-2xl border border-slate-800">
                <button
                  onClick={() => setSelectedCompanyDetail(null)}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center space-x-2 transition-all shadow-md"
                >
                  <ArrowLeft className="w-4 h-4 text-indigo-400" />
                  <span>← Back to All Client Tenants List</span>
                </button>

                <div className="flex items-center space-x-2 text-xs text-slate-400">
                  <span>Viewing Super Admin Control View for:</span>
                  <span className="font-bold text-white px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg">
                    {selectedCompanyDetail.name}
                  </span>
                </div>
              </div>

              {/* Company Header Card */}
              <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 p-6 rounded-2xl shadow-xl space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-3">
                      <h2 className="text-2xl font-black text-white">{selectedCompanyDetail.name}</h2>
                      <span className="px-3 py-0.5 text-xs font-bold bg-indigo-950 text-indigo-300 border border-indigo-700 rounded-full capitalize">
                        {selectedCompanyDetail.plan} Plan
                      </span>
                      <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full uppercase ${
                        selectedCompanyDetail.status === 'active' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}>
                        ● {selectedCompanyDetail.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 flex items-center space-x-3">
                      <span>Domain: <strong className="text-slate-200 font-mono">{selectedCompanyDetail.domain}</strong></span>
                      <span>&bull;</span>
                      <span>Workforce: <strong className="text-slate-200">{selectedCompanyDetail.employeeCount} active users</strong></span>
                      <span>&bull;</span>
                      <span>Industry: <strong className="text-indigo-300">{selectedCompanyDetail.industry || 'Enterprise Business & Technology'}</strong></span>
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => handleOpenBasicInfoModal(selectedCompanyDetail)}
                      className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-all shadow-md"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Edit Company Details</span>
                    </button>
                    <button
                      onClick={() => handleOpenPermissionsModal(selectedCompanyDetail)}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-indigo-200 text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-all border border-slate-700"
                    >
                      <Shield className="w-4 h-4 text-emerald-400" />
                      <span>Delegated Access</span>
                    </button>
                  </div>
                </div>

                {/* Company Description Banner */}
                <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider block">Company Description & Business Function:</span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {selectedCompanyDetail.description || `${selectedCompanyDetail.name} operates enterprise software solutions and managed workforce platforms.`}
                  </p>
                </div>
              </div>

              {/* Company Detail Navigation Sub-Tabs */}
              <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 overflow-x-auto">
                <button
                  onClick={() => setSelectedCompanyDetailSubTab('overview')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 ${
                    selectedCompanyDetailSubTab === 'overview'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-indigo-400" />
                  <span>Overview & Details</span>
                </button>

                <button
                  onClick={() => setSelectedCompanyDetailSubTab('persona')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 ${
                    selectedCompanyDetailSubTab === 'persona'
                      ? 'bg-pink-600 text-white shadow-md'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  <Bot className="w-4 h-4 text-pink-400" />
                  <span>Kati AI Persona & Tone</span>
                </button>

                <button
                  onClick={() => setSelectedCompanyDetailSubTab('permissions')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 ${
                    selectedCompanyDetailSubTab === 'permissions'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span>Delegated Permissions</span>
                </button>

                <button
                  onClick={() => setSelectedCompanyDetailSubTab('policies')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 ${
                    selectedCompanyDetailSubTab === 'policies'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  <FileText className="w-4 h-4 text-purple-400" />
                  <span>Policy Documents ({selectedCompanyDetail.policies.length})</span>
                </button>

                <button
                  onClick={() => setSelectedCompanyDetailSubTab('history')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 ${
                    selectedCompanyDetailSubTab === 'history'
                      ? 'bg-amber-600 text-white shadow-md'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  <History className="w-4 h-4 text-amber-400" />
                  <span>Change History & Audit Logs</span>
                </button>
              </div>

              {/* Sub-Tab 1: Overview & Details */}
              {selectedCompanyDetailSubTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
                  <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
                    <h3 className="text-sm font-bold text-white flex items-center justify-between border-b border-slate-800 pb-2">
                      <span>Enterprise Profile & Metadata</span>
                      <button
                        onClick={() => handleOpenBasicInfoModal(selectedCompanyDetail)}
                        className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center space-x-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                    </h3>

                    <div className="space-y-3">
                      <div className="flex justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-850">
                        <span className="text-slate-400">Company Legal Name:</span>
                        <strong className="text-white">{selectedCompanyDetail.name}</strong>
                      </div>
                      <div className="flex justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-850">
                        <span className="text-slate-400">Industry Sector:</span>
                        <strong className="text-indigo-300">{selectedCompanyDetail.industry || 'Enterprise Technology'}</strong>
                      </div>
                      <div className="flex justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-850">
                        <span className="text-slate-400">Primary Domain Name:</span>
                        <strong className="font-mono text-emerald-400">{selectedCompanyDetail.domain}</strong>
                      </div>
                      <div className="flex justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-850">
                        <span className="text-slate-400">Active Workforce Count:</span>
                        <strong className="text-white">{selectedCompanyDetail.employeeCount} active accounts</strong>
                      </div>
                      <div className="flex justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-850">
                        <span className="text-slate-400">Subscription Tier:</span>
                        <strong className="capitalize text-purple-300">{selectedCompanyDetail.plan} Plan</strong>
                      </div>
                      <div className="flex justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-850">
                        <span className="text-slate-400">Tenant Provisioning Date:</span>
                        <strong className="font-mono text-slate-300">{selectedCompanyDetail.createdAt}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
                    <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2 flex items-center space-x-2">
                      <Lock className="w-4 h-4 text-emerald-400" />
                      <span>Security Architecture & KMS Isolation</span>
                    </h3>

                    <div className="space-y-3">
                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 space-y-1">
                        <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Cryptographic KMS Key Namespace:</span>
                        <p className="font-mono text-emerald-400 font-bold text-xs">
                          {selectedCompanyDetail.isolatedEncryptionKeyId}
                        </p>
                      </div>

                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 space-y-1">
                        <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Policy Document Vector Embeddings:</span>
                        <p className="text-slate-300 font-bold text-xs">
                          {selectedCompanyDetail.policies.length} documents indexed under isolated namespace
                        </p>
                      </div>

                      <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-emerald-300 space-y-1">
                        <span className="font-bold flex items-center space-x-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Tenant Isolation Verification Verified</span>
                        </span>
                        <p className="text-[11px] text-emerald-200/80">
                          Data access is cryptographically restricted. Neither other tenants nor standard company admins can leak cross-tenant vector index state.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-Tab 2: Kati AI Persona & Tone */}
              {selectedCompanyDetailSubTab === 'persona' && (
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-5 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center space-x-2">
                        <Bot className="w-5 h-5 text-pink-400" />
                        <span>Kati AI Bot Persona & Tone Configuration</span>
                      </h3>
                      <p className="text-slate-400 text-xs">
                        Configured exclusively by Super Admin for {selectedCompanyDetail.name}.
                      </p>
                    </div>
                    <button
                      onClick={() => handleOpenPersonaModal(selectedCompanyDetail)}
                      className="px-3.5 py-2 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-xl flex items-center space-x-1.5 shadow-md"
                    >
                      <Sliders className="w-4 h-4" />
                      <span>Edit Kati Persona</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 space-y-1">
                      <span className="text-slate-500 font-semibold block">Bot Identity Name:</span>
                      <strong className="text-lg text-white font-bold">{selectedCompanyDetail.katiConfig.botName}</strong>
                    </div>

                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 space-y-1">
                      <span className="text-slate-500 font-semibold block">Conversational Tone:</span>
                      <strong className="text-lg text-pink-300 font-bold capitalize">{selectedCompanyDetail.katiConfig.tone}</strong>
                    </div>

                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 space-y-1">
                      <span className="text-slate-500 font-semibold block">Policy Enforcement Strictness:</span>
                      <strong className="text-lg text-purple-300 font-bold capitalize">{selectedCompanyDetail.katiConfig.policyStrictness}</strong>
                    </div>

                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 space-y-1">
                      <span className="text-slate-500 font-semibold block">Human HR Escalation Email:</span>
                      <strong className="text-sm font-mono text-indigo-300">{selectedCompanyDetail.katiConfig.escalationEmail}</strong>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 space-y-1">
                    <span className="text-slate-500 font-semibold block">Custom Greeting Message:</span>
                    <p className="text-slate-200 italic leading-relaxed">"{selectedCompanyDetail.katiConfig.customGreeting}"</p>
                  </div>
                </div>
              )}

              {/* Sub-Tab 3: Delegated Permissions */}
              {selectedCompanyDetailSubTab === 'permissions' && (
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-5 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center space-x-2">
                        <Shield className="w-5 h-5 text-emerald-400" />
                        <span>Company Admin Access Permissions</span>
                      </h3>
                      <p className="text-slate-400 text-xs">
                        Controls what the company admin for {selectedCompanyDetail.name} is permitted to edit or view.
                      </p>
                    </div>
                    <button
                      onClick={() => handleOpenPermissionsModal(selectedCompanyDetail)}
                      className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center space-x-1.5 shadow-md"
                    >
                      <Shield className="w-4 h-4" />
                      <span>Manage Permissions</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={`p-4 rounded-xl border ${selectedCompanyDetail.adminPermissions?.canEditPersonaAndTone ? 'bg-indigo-950/40 border-indigo-800' : 'bg-slate-950 border-slate-800 opacity-60'}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">Kati Persona & Tone Access</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${selectedCompanyDetail.adminPermissions?.canEditPersonaAndTone ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'}`}>
                          {selectedCompanyDetail.adminPermissions?.canEditPersonaAndTone ? 'ALLOWED' : 'HIDDEN & RESTRICTED'}
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px] mt-1">If hidden, Company Admin cannot view or edit Kati's persona & tone parameters.</p>
                    </div>

                    <div className={`p-4 rounded-xl border ${selectedCompanyDetail.adminPermissions?.canEditCompanyInfo ? 'bg-indigo-950/40 border-indigo-800' : 'bg-slate-950 border-slate-800 opacity-60'}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">Company Info Editing</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${selectedCompanyDetail.adminPermissions?.canEditCompanyInfo ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'}`}>
                          {selectedCompanyDetail.adminPermissions?.canEditCompanyInfo ? 'ALLOWED' : 'RESTRICTED'}
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px] mt-1">Allows Company Admin to update basic information, industry, and company description.</p>
                    </div>

                    <div className={`p-4 rounded-xl border ${selectedCompanyDetail.adminPermissions?.canAddPolicy ? 'bg-indigo-950/40 border-indigo-800' : 'bg-slate-950 border-slate-800 opacity-60'}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">Add Policy Documents</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${selectedCompanyDetail.adminPermissions?.canAddPolicy ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'}`}>
                          {selectedCompanyDetail.adminPermissions?.canAddPolicy ? 'ALLOWED' : 'RESTRICTED'}
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px] mt-1">Allows Company Admin to upload and create new HR policy documents.</p>
                    </div>

                    <div className={`p-4 rounded-xl border ${selectedCompanyDetail.adminPermissions?.canEditPolicies ? 'bg-indigo-950/40 border-indigo-800' : 'bg-slate-950 border-slate-800 opacity-60'}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">Edit Policy Content</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${selectedCompanyDetail.adminPermissions?.canEditPolicies ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'}`}>
                          {selectedCompanyDetail.adminPermissions?.canEditPolicies ? 'ALLOWED' : 'RESTRICTED'}
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px] mt-1">Allows Company Admin to modify existing indexed policy document texts.</p>
                    </div>

                    <div className={`p-4 rounded-xl border ${selectedCompanyDetail.adminPermissions?.canDeletePolicies ? 'bg-indigo-950/40 border-indigo-800' : 'bg-slate-950 border-slate-800 opacity-60'}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">Delete Policy Documents</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${selectedCompanyDetail.adminPermissions?.canDeletePolicies ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'}`}>
                          {selectedCompanyDetail.adminPermissions?.canDeletePolicies ? 'ALLOWED' : 'RESTRICTED'}
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px] mt-1">Allows Company Admin to remove policy documents from vector store.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-Tab 4: Policy Documents */}
              {selectedCompanyDetailSubTab === 'policies' && (
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center space-x-2">
                        <FileText className="w-5 h-5 text-purple-400" />
                        <span>Company HR Policy Documents ({selectedCompanyDetail.policies.length})</span>
                      </h3>
                      <p className="text-slate-400 text-xs">Super Admin can view, add, edit, or delete any company policy.</p>
                    </div>
                    <button
                      onClick={() => setDetailShowAddPolicyModal(true)}
                      className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl flex items-center space-x-1.5 shadow-md"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Add New Policy</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedCompanyDetail.policies.map((p) => (
                      <div key={p.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white text-sm">{p.title}</span>
                            <span className="px-2 py-0.5 bg-indigo-950 text-indigo-300 border border-indigo-800 rounded text-[10px] font-mono">
                              {p.version}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Category: {p.category}</div>
                          <p className="text-slate-300 text-xs line-clamp-3 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                            {p.content}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-850 text-[11px]">
                          <span className="text-slate-500">Updated: {p.lastUpdated}</span>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setDetailEditingPolicy(p);
                                setDetailEditPolicyTitle(p.title);
                                setDetailEditPolicyCategory(p.category);
                                setDetailEditPolicyContent(p.content);
                                setDetailEditPolicyVersion(p.version);
                              }}
                              className="px-2.5 py-1 bg-indigo-950 hover:bg-indigo-900 text-indigo-300 rounded border border-indigo-700/60 font-semibold"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDetailDeletePolicy(p.id, p.title)}
                              className="px-2.5 py-1 bg-rose-950 hover:bg-rose-900 text-rose-300 rounded border border-rose-800/60 font-semibold"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sub-Tab 5: Change History / Audit Logs */}
              {selectedCompanyDetailSubTab === 'history' && (
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center space-x-2">
                        <History className="w-5 h-5 text-amber-400" />
                        <span>Company Modification History & Audit Trail</span>
                      </h3>
                      <p className="text-slate-400 text-xs">
                        Complete change records recorded for <strong>{selectedCompanyDetail.name}</strong>.
                      </p>
                    </div>
                  </div>

                  {auditLogs.filter((log) => log.tenantId === selectedCompanyDetail.id).length === 0 ? (
                    <div className="p-8 text-center text-slate-500 bg-slate-950 rounded-xl border border-slate-800">
                      No specific change logs recorded for this tenant yet.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-300">
                        <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                          <tr>
                            <th className="p-3">Timestamp</th>
                            <th className="p-3">Action Description</th>
                            <th className="p-3">Actor / Admin</th>
                            <th className="p-3">KMS Security Domain</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-850">
                          {auditLogs
                            .filter((log) => log.tenantId === selectedCompanyDetail.id)
                            .map((log) => (
                              <tr key={log.id} className="hover:bg-slate-850/50">
                                <td className="p-3 font-mono text-slate-400 whitespace-nowrap">{log.timestamp}</td>
                                <td className="p-3 font-bold text-white">{log.action}</td>
                                <td className="p-3 text-indigo-300 font-mono">{log.actorEmail}</td>
                                <td className="p-3 font-mono text-emerald-400 text-[10px]">{log.securityDomain}</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Client Tenants List / Grid Directory View */
            <div className="space-y-5">
              {/* Controls: Search Bar & Grid/List Toggle */}
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search client tenants by company name, domain, industry, description, or plan..."
                    value={tenantSearchQuery}
                    onChange={(e) => setTenantSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  {tenantSearchQuery && (
                    <button
                      onClick={() => setTenantSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Grid / List View Toggle */}
                <div className="flex items-center space-x-2 shrink-0">
                  <span className="text-slate-400 text-xs font-semibold">View Mode:</span>
                  <button
                    onClick={() => setTenantViewMode('grid')}
                    className={`p-2 rounded-xl border text-xs font-bold transition-all flex items-center space-x-1.5 ${
                      tenantViewMode === 'grid'
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                    title="Grid View"
                  >
                    <LayoutGrid className="w-4 h-4" />
                    <span>Grid</span>
                  </button>

                  <button
                    onClick={() => setTenantViewMode('list')}
                    className={`p-2 rounded-xl border text-xs font-bold transition-all flex items-center space-x-1.5 ${
                      tenantViewMode === 'list'
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                    title="List View"
                  >
                    <List className="w-4 h-4" />
                    <span>List</span>
                  </button>
                </div>
              </div>

              {/* Filtering tenants based on search query */}
              {(() => {
                const filteredTenants = tenants.filter((t) => {
                  const q = tenantSearchQuery.toLowerCase().trim();
                  if (!q) return true;
                  return (
                    t.name.toLowerCase().includes(q) ||
                    t.domain.toLowerCase().includes(q) ||
                    (t.industry && t.industry.toLowerCase().includes(q)) ||
                    (t.description && t.description.toLowerCase().includes(q)) ||
                    t.plan.toLowerCase().includes(q)
                  );
                });

                if (filteredTenants.length === 0) {
                  return (
                    <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center space-y-3">
                      <p className="text-slate-400 text-sm">No client tenants match your search query "{tenantSearchQuery}".</p>
                      <button
                        onClick={() => setTenantSearchQuery('')}
                        className="px-4 py-2 bg-indigo-600 text-white text-xs rounded-xl font-bold"
                      >
                        Clear Search Filter
                      </button>
                    </div>
                  );
                }

                if (tenantViewMode === 'grid') {
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {filteredTenants.map((t) => (
                        <div key={t.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4 flex flex-col justify-between hover:border-slate-700 transition-all">
                          <div>
                            <div className="flex items-center justify-between">
                              <button
                                onClick={() => setSelectedCompanyDetail(t)}
                                className="text-base font-bold text-white hover:text-indigo-400 text-left transition-colors flex items-center space-x-1.5 group"
                              >
                                <span>{t.name}</span>
                                <ExternalLink className="w-3.5 h-3.5 text-indigo-400 opacity-60 group-hover:opacity-100" />
                              </button>
                              <span className="px-2.5 py-0.5 text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800 rounded-full capitalize">
                                {t.plan}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 font-mono mt-1">Domain: {t.domain}</p>

                            {/* Industry & Short Description */}
                            <div className="mt-2 text-xs text-slate-300 bg-slate-950 p-2.5 rounded-xl border border-slate-850 space-y-1">
                              <span className="text-[10px] text-indigo-400 uppercase font-bold tracking-wider block">Industry & Operations:</span>
                              <p className="line-clamp-2 text-slate-300 text-[11px]">
                                {t.description || `${t.name} provides enterprise services for clients.`}
                              </p>
                            </div>

                            {/* Basic Info Overview & Edit Button */}
                            <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-2 text-xs mt-3">
                              <div className="flex items-center justify-between pb-1 border-b border-slate-850">
                                <span className="text-[10px] text-indigo-300 uppercase font-bold tracking-wider">Basic Information</span>
                                <button
                                  onClick={() => handleOpenBasicInfoModal(t)}
                                  className="px-2 py-0.5 bg-indigo-950 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-300 rounded text-[10px] font-bold flex items-center space-x-1 transition-all"
                                >
                                  <Edit3 className="w-3 h-3 text-indigo-400" />
                                  <span>Edit</span>
                                </button>
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="text-slate-500">System Status:</span>
                                <span className={`font-semibold uppercase text-[10px] ${t.status === 'active' ? 'text-emerald-400' : 'text-amber-400'}`}>
                                  ● {t.status}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-slate-500">Employee Count:</span>
                                <span className="text-slate-200 font-semibold">{t.employeeCount} active</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-slate-500">Policies Indexed:</span>
                                <span className="text-purple-300 font-semibold">{t.policies.length} documents</span>
                              </div>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-slate-800 space-y-2">
                            <button
                              onClick={() => setSelectedCompanyDetail(t)}
                              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center space-x-1.5"
                            >
                              <span>View Full Company Detail Page</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleOpenPermissionsModal(t)}
                              className="w-full py-1.5 bg-slate-950 hover:bg-slate-900 text-indigo-200 border border-slate-800 rounded-xl text-xs font-semibold transition-all flex items-center justify-center space-x-1.5"
                            >
                              <Shield className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Manage Company Admin Access</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                }

                // List View Mode
                return (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden text-xs shadow-xl">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-slate-300">
                        <thead className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800">
                          <tr>
                            <th className="p-3.5">Company Name & Sector</th>
                            <th className="p-3.5">Domain</th>
                            <th className="p-3.5">Plan Tier</th>
                            <th className="p-3.5">Workforce</th>
                            <th className="p-3.5">Status</th>
                            <th className="p-3.5">Policies</th>
                            <th className="p-3.5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-850">
                          {filteredTenants.map((t) => (
                            <tr key={t.id} className="hover:bg-slate-850/50 transition-colors">
                              <td className="p-3.5">
                                <button
                                  onClick={() => setSelectedCompanyDetail(t)}
                                  className="font-bold text-white hover:text-indigo-400 text-sm text-left flex items-center space-x-1.5 group"
                                >
                                  <span>{t.name}</span>
                                  <ExternalLink className="w-3.5 h-3.5 text-indigo-400 opacity-60 group-hover:opacity-100" />
                                </button>
                                <span className="text-[11px] text-indigo-300 block mt-0.5">
                                  {t.industry || 'Enterprise Business & Operations'}
                                </span>
                              </td>
                              <td className="p-3.5 font-mono text-emerald-400">{t.domain}</td>
                              <td className="p-3.5 capitalize font-semibold text-purple-300">{t.plan}</td>
                              <td className="p-3.5 font-semibold text-white">{t.employeeCount} active</td>
                              <td className="p-3.5">
                                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                                  t.status === 'active' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                                }`}>
                                  ● {t.status}
                                </span>
                              </td>
                              <td className="p-3.5 font-bold text-purple-300">{t.policies.length} docs</td>
                              <td className="p-3.5 text-right whitespace-nowrap space-x-1.5">
                                <button
                                  onClick={() => setSelectedCompanyDetail(t)}
                                  title="View Company Details"
                                  className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-md inline-flex items-center space-x-1"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                  <span className="hidden sm:inline">Details</span>
                                </button>
                                <button
                                  onClick={() => handleOpenBasicInfoModal(t)}
                                  title="Edit Company Basic Info"
                                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs border border-slate-700 inline-flex items-center space-x-1"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                  <span className="hidden sm:inline">Edit</span>
                                </button>
                                <button
                                  onClick={() => handleOpenPermissionsModal(t)}
                                  title="Manage Delegated Permissions"
                                  className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-850 text-emerald-300 font-semibold rounded-xl text-xs border border-slate-800 inline-flex items-center space-x-1"
                                >
                                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                                  <span className="hidden sm:inline">Permissions</span>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Security & Isolation Auditor */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Lock className="w-5 h-5 text-emerald-400" />
              <span>Multi-Tenant Data Isolation Audit & KMS Key Status</span>
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every client tenant on <strong>hrsolution.com</strong> is isolated via cryptographic KMS key namespaces. Cross-tenant RAG querying is prohibited at the system prompt and embedding level.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-1">
                <span className="text-slate-400 font-medium">Cross-Tenant Data Leakage:</span>
                <p className="text-lg font-bold text-emerald-400">0 Incidents Detected</p>
                <p className="text-[10px] text-slate-500">Strict RAG isolation active</p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-1">
                <span className="text-slate-400 font-medium">Active KMS Keys Provisioned:</span>
                <p className="text-lg font-bold text-indigo-300">{tenants.length} Dedicated Keys</p>
                <p className="text-[10px] text-slate-500">AWS / GCP KMS Key Store</p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-1">
                <span className="text-slate-400 font-medium">Security Standard Compliance:</span>
                <p className="text-lg font-bold text-purple-300">SOC2 Type II & HIPAA</p>
                <p className="text-[10px] text-slate-500">Automated Audit Logger</p>
              </div>
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-indigo-400" />
              <span>Real-Time Multi-Tenant System Security Audit Stream</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Tenant / Company</th>
                    <th className="p-3">Security Action</th>
                    <th className="p-3">Actor Email</th>
                    <th className="p-3">KMS / Security Domain</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-950/40">
                      <td className="p-3 font-mono text-[11px] text-slate-400">{log.timestamp}</td>
                      <td className="p-3 font-bold text-slate-200">{log.companyName}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 text-[10px] font-mono border border-indigo-800/60">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400">{log.actorEmail}</td>
                      <td className="p-3 font-mono text-[11px] text-emerald-400">{log.securityDomain}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Global Analytics */}
      {activeTab === 'analytics' && globalAnalytics && (
        <AnalyticsCharts analytics={globalAnalytics} title="Platform-Wide Global Kati HR Analytics" />
      )}

      {/* Tab 4: Prompt Engine */}
      {activeTab === 'prompt_engine' && (
        <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-indigo-400" />
            <span>Kati AI Core System Instruction Architecture</span>
          </h2>
          <p className="text-xs text-slate-400">
            This master baseline prompt governs Kati AI HR across all enterprise clients on <strong>hrsolution.com</strong>, enforcing strict multi-tenant boundaries and empathetic tone.
          </p>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-indigo-200 leading-relaxed whitespace-pre-wrap">
{`[GLOBAL SYSTEM INSTRUCTION - KATI AI CORE ENGINE]
1. You are Kati, the official AI HR Assistant for {companyName}.
2. You must exclusively use policy documents indexed under KMS Key ID: {isolatedEncryptionKeyId}.
3. STRICT DATA BOUNDARY: Under NO circumstance reference, confirm, or leak policy details from other tenants.
4. Always cite official policy title and version number when answering employee inquiries.
5. If an inquiry exceeds policy bounds, provide a direct escalation link to {escalationEmail}.`}
          </div>
        </div>
      )}

      {/* Provision New Client Modal */}
      {showProvisionModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-indigo-400" />
                <span>Provision New Enterprise Client Tenant</span>
              </h3>
              <button onClick={() => setShowProvisionModal(false)} className="text-slate-400 text-xs">✕</button>
            </div>

            <form onSubmit={handleProvisionSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Logistics"
                  value={newCompName}
                  onChange={(e) => setNewCompName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Domain</label>
                  <input
                    type="text"
                    required
                    placeholder="apexlogistics.io"
                    value={newCompDomain}
                    onChange={(e) => setNewCompDomain(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Employee Count</label>
                  <input
                    type="number"
                    value={newEmpCount}
                    onChange={(e) => setNewEmpCount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Subscription Tier</label>
                <select
                  value={newCompPlan}
                  onChange={(e) => setNewCompPlan(e.target.value as any)}
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
                  onClick={() => setShowProvisionModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold shadow-md"
                >
                  Provision Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Permission Control Modal for Selected Tenant */}
      {selectedTenantForPermissions && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-indigo-400" />
                  <span>Company Admin Access Permissions & Features</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Target Tenant: <strong>{selectedTenantForPermissions.name}</strong> ({selectedTenantForPermissions.domain})
                </p>
              </div>
              <button
                onClick={() => setSelectedTenantForPermissions(null)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePermissionsSubmit} className="space-y-4 text-xs">
              <div className="p-3 bg-indigo-950/40 border border-indigo-800/60 rounded-xl text-indigo-200">
                <p className="font-semibold mb-1">Super Admin Delegation Policy:</p>
                <p className="text-[11px] text-indigo-300 leading-relaxed">
                  Toggle which editing capabilities and buttons appear in the Company Admin Dashboard for {selectedTenantForPermissions.name}.
                </p>
              </div>

              <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                {/* 1. Kati AI Persona & Tone */}
                <label className="flex items-start justify-between cursor-pointer space-x-3 p-2 rounded-lg hover:bg-slate-900/60 transition-all">
                  <div>
                    <span className="font-bold text-white block">Change Kati AI Persona & Tone</span>
                    <span className="text-[11px] text-slate-400">
                      Allows Company Admin to edit Kati AI bot name, tone, greeting, and escalation contact.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={permPersona}
                    onChange={(e) => setPermPersona(e.target.checked)}
                    className="w-4 h-4 mt-1 accent-indigo-600 rounded cursor-pointer"
                  />
                </label>

                {/* 2. Edit Company Info */}
                <label className="flex items-start justify-between cursor-pointer space-x-3 p-2 rounded-lg hover:bg-slate-900/60 transition-all border-t border-slate-850 pt-3">
                  <div>
                    <span className="font-bold text-white block">Edit Company Details & Information</span>
                    <span className="text-[11px] text-slate-400">
                      Allows Company Admin to edit company name, domain, plan, and employee count.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={permCompanyInfo}
                    onChange={(e) => setPermCompanyInfo(e.target.checked)}
                    className="w-4 h-4 mt-1 accent-indigo-600 rounded cursor-pointer"
                  />
                </label>

                {/* 3. Show Add Policy Button */}
                <label className="flex items-start justify-between cursor-pointer space-x-3 p-2 rounded-lg hover:bg-slate-900/60 transition-all border-t border-slate-850 pt-3">
                  <div>
                    <span className="font-bold text-white block">Display &apos;Add Policy Document&apos; Button</span>
                    <span className="text-[11px] text-slate-400">
                      Shows the &apos;+ Add Policy Document&apos; button for Company Admin to add new HR policies to Kati RAG engine.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={permAddPolicy}
                    onChange={(e) => setPermAddPolicy(e.target.checked)}
                    className="w-4 h-4 mt-1 accent-indigo-600 rounded cursor-pointer"
                  />
                </label>

                {/* 4. Show Edit Policy Button */}
                <label className="flex items-start justify-between cursor-pointer space-x-3 p-2 rounded-lg hover:bg-slate-900/60 transition-all border-t border-slate-850 pt-3">
                  <div>
                    <span className="font-bold text-white block">Display &apos;Edit Policy&apos; Button</span>
                    <span className="text-[11px] text-slate-400">
                      Shows the Edit button on policy cards for Company Admin to update existing policy documents.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={permEditPolicy}
                    onChange={(e) => setPermEditPolicy(e.target.checked)}
                    className="w-4 h-4 mt-1 accent-indigo-600 rounded cursor-pointer"
                  />
                </label>

                {/* 4. Show Delete Policy Button */}
                <label className="flex items-start justify-between cursor-pointer space-x-3 p-2 rounded-lg hover:bg-slate-900/60 transition-all border-t border-slate-850 pt-3">
                  <div>
                    <span className="font-bold text-white block">Display &apos;Delete Policy&apos; Button</span>
                    <span className="text-[11px] text-slate-400">
                      Shows the Delete button on policy documents for Company Admin to remove policies.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={permDeletePolicy}
                    onChange={(e) => setPermDeletePolicy(e.target.checked)}
                    className="w-4 h-4 mt-1 accent-indigo-600 rounded cursor-pointer"
                  />
                </label>
              </div>

              {permSavedSuccess && (
                <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-300 rounded-xl flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Permissions updated for {selectedTenantForPermissions.name}!</span>
                </div>
              )}

              <div className="flex items-center justify-end space-x-2 border-t border-slate-800 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedTenantForPermissions(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow-md flex items-center space-x-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Apply Permission Grants</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Super Admin: Kati AI Persona View & Edit Modal */}
      {selectedTenantForPersona && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Bot className="w-5 h-5 text-pink-400" />
                  <span>Kati AI Persona & System Settings (Super Admin View)</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Client Tenant: <strong>{selectedTenantForPersona.name}</strong> ({selectedTenantForPersona.domain})
                </p>
              </div>
              <button
                onClick={() => setSelectedTenantForPersona(null)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTenantPersonaSubmit} className="space-y-4 text-xs">
              <div className="p-3 bg-pink-950/30 border border-pink-800/50 rounded-xl text-pink-200">
                <p className="font-semibold mb-0.5">Super Admin Persona Management:</p>
                <p className="text-[11px] text-pink-300/80 leading-relaxed">
                  Only Super Admins can configure the Kati AI HR persona, conversational tone, and escalation pathways for {selectedTenantForPersona.name}.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">AI HR Bot Display Name</label>
                <input
                  type="text"
                  required
                  value={personaBotName}
                  onChange={(e) => setPersonaBotName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Conversational Tone</label>
                  <select
                    value={personaTone}
                    onChange={(e) => setPersonaTone(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white"
                  >
                    <option value="empathetic">Empathetic & Warm</option>
                    <option value="professional">Professional & Direct</option>
                    <option value="strict">Strict Compliance</option>
                    <option value="casual">Casual & Modern</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Policy Strictness</label>
                  <select
                    value={personaStrictness}
                    onChange={(e) => setPersonaStrictness(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white"
                  >
                    <option value="balanced">Balanced (Standard RAG)</option>
                    <option value="strict">Strict (Literal Citations Only)</option>
                    <option value="flexible">Flexible Guidance</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Custom Welcome Greeting</label>
                <textarea
                  rows={3}
                  value={personaGreeting}
                  onChange={(e) => setPersonaGreeting(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">HR Escalation Email</label>
                <input
                  type="email"
                  required
                  value={personaEscalationEmail}
                  onChange={(e) => setPersonaEscalationEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white"
                />
              </div>

              {personaSavedSuccess && (
                <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-300 rounded-xl flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Kati AI Persona updated for {selectedTenantForPersona.name}!</span>
                </div>
              )}

              <div className="flex items-center justify-end space-x-2 border-t border-slate-800 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedTenantForPersona(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-xl font-semibold shadow-md flex items-center space-x-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Persona Configurations</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Super Admin: Edit Company Basic Info Modal with Confirmation Step */}
      {selectedTenantForBasicInfo && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Building2 className="w-5 h-5 text-indigo-400" />
                  <span>Edit Company Basic Information</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Tenant ID: <strong className="font-mono text-indigo-300">{selectedTenantForBasicInfo.id}</strong>
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedTenantForBasicInfo(null);
                  setShowBasicInfoConfirmStep(false);
                }}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            {!showBasicInfoConfirmStep ? (
              /* Step 1: Edit Form */
              <form onSubmit={handlePrepareBasicInfoConfirm} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Company Full Name *</label>
                  <input
                    type="text"
                    required
                    value={basicName}
                    onChange={(e) => setBasicName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Domain *</label>
                    <input
                      type="text"
                      required
                      value={basicDomain}
                      onChange={(e) => setBasicDomain(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Active Employee Count *</label>
                    <input
                      type="number"
                      required
                      value={basicEmployeeCount}
                      onChange={(e) => setBasicEmployeeCount(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Industry Sector</label>
                  <input
                    type="text"
                    value={basicIndustry}
                    onChange={(e) => setBasicIndustry(e.target.value)}
                    placeholder="e.g. Technology, Healthcare, Finance"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Company Description (Super Admin Editable)</label>
                  <textarea
                    rows={3}
                    value={basicDescription}
                    onChange={(e) => setBasicDescription(e.target.value)}
                    placeholder="Provide a description of the company's core operations..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Subscription Plan</label>
                    <select
                      value={basicPlan}
                      onChange={(e) => setBasicPlan(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white"
                    >
                      <option value="enterprise">Enterprise Plan</option>
                      <option value="growth">Growth Plan</option>
                      <option value="starter">Starter Plan</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">System Status</label>
                    <select
                      value={basicStatus}
                      onChange={(e) => setBasicStatus(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white"
                    >
                      <option value="active">Active (Operational)</option>
                      <option value="provisioning">Provisioning</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                </div>

                <div className="p-3 bg-amber-950/30 border border-amber-800/50 rounded-xl text-amber-200 text-[11px] leading-relaxed flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    Note: Submitting this form will prompt you for explicit confirmation before saving modifications to {selectedTenantForBasicInfo.name}.
                  </span>
                </div>

                <div className="flex items-center justify-end space-x-2 border-t border-slate-800 pt-3">
                  <button
                    type="button"
                    onClick={() => setSelectedTenantForBasicInfo(null)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-semibold hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow-md flex items-center space-x-1.5"
                  >
                    <span>Review & Confirm Changes</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            ) : (
              /* Step 2: Explicit Confirmation Screen */
              <div className="space-y-4 text-xs">
                <div className="p-3.5 bg-amber-950/60 border border-amber-800 text-amber-200 rounded-xl flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-amber-300 text-sm">Confirm Basic Information Update</p>
                    <p className="text-[11px] text-amber-200/90 mt-0.5 leading-relaxed">
                      Please review the modified company profile values below for <strong>{selectedTenantForBasicInfo.name}</strong> before confirming the system update.
                    </p>
                  </div>
                </div>

                {/* Summary Table of Changes */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-800">
                      <tr>
                        <th className="p-2.5">Field</th>
                        <th className="p-2.5">Existing Value</th>
                        <th className="p-2.5 text-indigo-300">New Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850">
                      <tr>
                        <td className="p-2.5 font-semibold text-slate-400">Company Name</td>
                        <td className="p-2.5 text-slate-400">{selectedTenantForBasicInfo.name}</td>
                        <td className="p-2.5 font-bold text-emerald-400">{basicName}</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-semibold text-slate-400">Domain</td>
                        <td className="p-2.5 font-mono text-slate-400">{selectedTenantForBasicInfo.domain}</td>
                        <td className="p-2.5 font-mono font-bold text-indigo-300">{basicDomain}</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-semibold text-slate-400">Industry Sector</td>
                        <td className="p-2.5 text-slate-400">{selectedTenantForBasicInfo.industry || 'N/A'}</td>
                        <td className="p-2.5 font-bold text-indigo-300">{basicIndustry}</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-semibold text-slate-400">Company Description</td>
                        <td className="p-2.5 text-slate-400 max-w-[150px] truncate">{selectedTenantForBasicInfo.description || 'N/A'}</td>
                        <td className="p-2.5 font-medium text-slate-200 max-w-[180px] line-clamp-2">{basicDescription}</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-semibold text-slate-400">Subscription Plan</td>
                        <td className="p-2.5 capitalize text-slate-400">{selectedTenantForBasicInfo.plan}</td>
                        <td className="p-2.5 capitalize font-bold text-purple-300">{basicPlan}</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-semibold text-slate-400">Active Employees</td>
                        <td className="p-2.5 text-slate-400">{selectedTenantForBasicInfo.employeeCount}</td>
                        <td className="p-2.5 font-bold text-white">{basicEmployeeCount}</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-semibold text-slate-400">System Status</td>
                        <td className="p-2.5 uppercase text-slate-400">{selectedTenantForBasicInfo.status}</td>
                        <td className="p-2.5 uppercase font-bold text-emerald-400">{basicStatus}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {basicInfoSavedSuccess && (
                  <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-300 rounded-xl flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Company basic information successfully updated!</span>
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-slate-800 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowBasicInfoConfirmStep(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-semibold hover:bg-slate-700"
                  >
                    ← Back to Edit
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirmAndSaveBasicInfo}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg flex items-center space-x-2 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-100" />
                    <span>Confirm & Apply Changes</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
