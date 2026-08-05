import React, { useState } from 'react';
import { CompanyTenant, User } from '../types';
import {
  Sparkles,
  ShieldCheck,
  Building2,
  Users,
  CheckCircle2,
  ArrowRight,
  Lock,
  LineChart,
  UserCheck,
  Bot,
  Zap,
  ChevronRight,
  Database,
  Cpu,
} from 'lucide-react';

interface LandingPageProps {
  tenants: CompanyTenant[];
  onLoginEmail: (email: string) => void;
  onRegisterTenant: (data: Partial<CompanyTenant>) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  tenants,
  onLoginEmail,
  onRegisterTenant,
}) => {
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [loginInput, setLoginInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Register Form State
  const [companyName, setCompanyName] = useState('');
  const [domain, setDomain] = useState('');
  const [employeeCount, setEmployeeCount] = useState(100);
  const [adminEmail, setAdminEmail] = useState('');
  const [primaryPolicy, setPrimaryPolicy] = useState('');

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginInput.trim()) return;
    try {
      onLoginEmail(loginInput.trim());
    } catch (err: any) {
      setLoginError(err.message || 'Invalid user login');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !domain) return;
    onRegisterTenant({
      name: companyName,
      domain: domain.toLowerCase(),
      employeeCount: Number(employeeCount),
      customPolicies: [
        {
          id: `pol-${Date.now()}`,
          category: 'pto_leave',
          title: `${companyName} Employee Handbook & PTO Guidelines`,
          content: primaryPolicy || `${companyName} provides 20 days PTO and 10 paid holidays. Remote work stipend is $50/month.`,
          lastUpdated: new Date().toISOString().split('T')[0],
          version: 'v1.0',
          effectiveDate: new Date().toISOString().split('T')[0],
          tags: ['Handbook', 'PTO'],
        },
      ],
    });
    setShowRegisterModal(false);
    onLoginEmail(adminEmail || `admin@${domain}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-teal-500 selection:text-slate-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-16 md:pb-24 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-slate-900">
              Kati AI HR
              <br />
              <span className="text-teal-600 font-extrabold">The AI HR Engine for Enterprise.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              One multi-tenant platform for every corporate entity. Kati indexes your specific employee policy handbooks, runs auto-onboarding roadmap checklists, and provides real-time HR analytics &mdash; strictly isolated per tenant.
            </p>

            {/* Login & Portal Action Bar */}
            <div className="pt-2 bg-white border border-slate-200 p-6 rounded-2xl shadow-xl space-y-4 text-left">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-teal-600" />
                  <span>Secure Multi-Tenant Gateway & Portal Access</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Every company admin and employee logs in via <strong>hrsolution.com</strong> and is isolated into their dedicated KMS tenant shard.
                </p>
              </div>

              {/* 1-Click Quick Demo Login Profiles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                <button
                  onClick={() => onLoginEmail('admin@hrsolution.com')}
                  className="p-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left transition-all group shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-teal-400 flex items-center space-x-1.5">
                      <ShieldCheck className="w-4 h-4 text-teal-400" />
                      <span>Kati Central Creator</span>
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-teal-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1 font-medium">Super Admin Console</p>
                  <span className="text-[10px] text-teal-400 font-mono block mt-0.5 font-bold">admin@hrsolution.com</span>
                </button>

                <button
                  onClick={() => onLoginEmail('sarah@acmecorp.com')}
                  className="p-3.5 rounded-xl bg-slate-50 hover:bg-teal-50/50 border border-slate-200 hover:border-teal-300 text-left transition-all group shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                      <Building2 className="w-4 h-4 text-teal-600" />
                      <span>Acme Corp HR Admin</span>
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 font-medium">Sarah Connor (Head of HR)</p>
                  <span className="text-[10px] text-teal-700 font-mono block mt-0.5 font-bold">sarah@acmecorp.com</span>
                </button>

                <button
                  onClick={() => onLoginEmail('alex@acmecorp.com')}
                  className="p-3.5 rounded-xl bg-slate-50 hover:bg-teal-50/50 border border-slate-200 hover:border-teal-300 text-left transition-all group shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                      <UserCheck className="w-4 h-4 text-teal-600" />
                      <span>Acme New Employee</span>
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 font-medium">Alex Rivera (Onboarding)</p>
                  <span className="text-[10px] text-teal-700 font-mono block mt-0.5 font-bold">alex@acmecorp.com</span>
                </button>

                <button
                  onClick={() => onLoginEmail('marcus@zenithhealth.org')}
                  className="p-3.5 rounded-xl bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-300 text-left transition-all group shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      <span>Zenith Health Admin</span>
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 font-medium">Dr. Vance (HIPAA HR)</p>
                  <span className="text-[10px] text-blue-700 font-mono block mt-0.5 font-bold">marcus@zenithhealth.org</span>
                </button>
              </div>

              {/* Email Form & Custom Register */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200">
                <form onSubmit={handleCustomLogin} className="flex-1 w-full flex items-center space-x-2">
                  <input
                    type="email"
                    value={loginInput}
                    onChange={(e) => setLoginInput(e.target.value)}
                    placeholder="Enter work email (e.g., user@company.com)..."
                    className="flex-1 bg-slate-50 border border-slate-300 px-3.5 py-2.5 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 font-medium"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs rounded-xl transition-all shadow-md flex items-center space-x-1.5 whitespace-nowrap"
                  >
                    <span>Sign In</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>

                <button
                  onClick={() => setShowRegisterModal(true)}
                  className="w-full sm:w-auto px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all shadow-sm"
                >
                  + Onboard New Company
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid: 3 Pillars */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Architected for Multi-Tenant Security & Enterprise HR Scale
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Kati provides each enterprise client with an isolated policy knowledge graph, automated onboarding checklist, and real-time query analytics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl hover:border-teal-400 transition-all space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 font-bold">
                <Database className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">100% Isolated Policy Context</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Each company uploads unique employee handbooks, PTO limits, healthcare details, and safety rules. Kati applies strict RAG security boundaries per client tenant.
              </p>
              <ul className="text-xs text-slate-700 space-y-2 pt-2">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span className="font-semibold">Unique KMS encryption key ID per company</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span className="font-semibold">Custom Kati bot tone & escalation rules</span>
                </li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl hover:border-teal-400 transition-all space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 font-bold">
                <UserCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Automated Employee Onboarding</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Streamline new hire workflows with interactive step-by-step checklists, digital policy acknowledgments, tax forms, equipment requests, and instant Kati Q&A.
              </p>
              <ul className="text-xs text-slate-700 space-y-2 pt-2">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span className="font-semibold">Assigned mentor pairing & status tracker</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span className="font-semibold">Interactive Kati onboarding welcome tour</span>
                </li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl hover:border-teal-400 transition-all space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 font-bold">
                <LineChart className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Real-Time HR Analytics</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Empower HR leaders with live insights: resolution rates, top employee query topics (PTO, 401k, mental health), employee satisfaction (CSAT), and policy gaps.
              </p>
              <ul className="text-xs text-slate-700 space-y-2 pt-2">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span className="font-semibold">Auto-detect missing policies & high-volume topics</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span className="font-semibold">Weekly resolution trends & response times</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pre-Seeded Tenants List */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-teal-600" />
                <span>Active Client AI HR Entities on hrsolution.com</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Explore how Kati tailors policy reasoning uniquely for each client organization.
              </p>
            </div>
            <button
              onClick={() => setShowRegisterModal(true)}
              className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-black rounded-xl shadow-md transition-colors"
            >
              + Provision New Client Entity
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tenants.map((tenant) => (
              <div
                key={tenant.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-teal-300 shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-base font-black text-slate-900">{tenant.name}</span>
                    <span className="px-2.5 py-0.5 text-[10px] font-extrabold bg-teal-50 text-teal-700 border border-teal-200 rounded-full uppercase tracking-wider">
                      {tenant.plan}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mb-3 font-mono">Domain: {tenant.domain}</p>

                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 mb-4 text-xs font-medium">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Kati Bot Name:</span>
                      <span className="font-bold text-teal-700">{tenant.katiConfig.botName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Employees:</span>
                      <span className="font-bold text-slate-800">{tenant.employeeCount} active</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Policy Base:</span>
                      <span className="font-bold text-slate-800">{tenant.policies.length} documents</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => {
                      const adminUser = tenant.id === 'acme-corp' ? 'sarah@acmecorp.com' : 'marcus@zenithhealth.org';
                      onLoginEmail(adminUser);
                    }}
                    className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all text-center shadow-sm"
                  >
                    Login as HR Admin
                  </button>
                  {tenant.id === 'acme-corp' && (
                    <button
                      onClick={() => onLoginEmail('alex@acmecorp.com')}
                      className="py-2 px-3 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl text-xs font-black transition-all text-center shadow-sm"
                    >
                      Onboarding Hire
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modal: Provision New Tenant */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-indigo-400" />
                <span>Provision New Enterprise Client Tenant</span>
              </h3>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="text-slate-400 hover:text-slate-200 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NextGen Robotics Corp"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Company Domain *</label>
                  <input
                    type="text"
                    required
                    placeholder="nextgenrobotics.com"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Employee Count</label>
                  <input
                    type="number"
                    value={employeeCount}
                    onChange={(e) => setEmployeeCount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Initial HR Admin Work Email</label>
                <input
                  type="email"
                  placeholder="hr@nextgenrobotics.com"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Primary Company Policy / PTO Rule</label>
                <textarea
                  rows={3}
                  placeholder="Paste main PTO allowance, remote work policy, or health coverage details for Kati AI to index..."
                  value={primaryPolicy}
                  onChange={(e) => setPrimaryPolicy(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="bg-indigo-950/50 border border-indigo-800/40 p-3 rounded-xl flex items-start space-x-2 text-[11px] text-indigo-300">
                <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  A dedicated KMS encryption key ID will automatically be provisioned to isolate this client&apos;s data boundaries.
                </span>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow-md"
                >
                  Provision & Launch Dashboard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
