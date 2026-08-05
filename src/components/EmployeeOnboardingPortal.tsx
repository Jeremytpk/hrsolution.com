import React, { useState, useEffect } from 'react';
import { CompanyTenant, User, EmployeeOnboardingProgress, OnboardingTask } from '../types';
import { fetchOnboardingProgress, toggleOnboardingTask } from '../services/api';
import { KatiChatWidget } from './KatiChatWidget';
import { useLanguage } from '../context/LanguageContext';
import {
  CheckCircle2,
  Circle,
  FileText,
  Clock,
  UserCheck,
  Building2,
  Sparkles,
  Calendar,
  PenTool,
  ShieldAlert,
  Download,
  Send,
} from 'lucide-react';

interface EmployeeOnboardingPortalProps {
  tenant: CompanyTenant;
  currentUser: User;
}

export const EmployeeOnboardingPortal: React.FC<EmployeeOnboardingPortalProps> = ({
  tenant,
  currentUser,
}) => {
  const { t } = useLanguage();
  const [onboardingProgress, setOnboardingProgress] = useState<EmployeeOnboardingProgress | null>(null);
  const [activeTab, setActiveTab] = useState<'onboarding' | 'kati_chat' | 'policy_library' | 'pto_form'>('onboarding');
  const [ptoDays, setPtoDays] = useState(3);
  const [ptoReason, setPtoReason] = useState('Vacation');
  const [ptoSubmitted, setPtoSubmitted] = useState(false);

  useEffect(() => {
    fetchOnboardingProgress(tenant.id).then((list) => {
      const myProgress = list.find((e) => e.employeeId === currentUser.id) || list[0] || null;
      setOnboardingProgress(myProgress);
    });
  }, [tenant.id, currentUser.id]);

  const handleTaskToggle = async (task: OnboardingTask) => {
    if (!onboardingProgress) return;
    const newStatus = !task.completed;
    const updatedList = await toggleOnboardingTask(tenant.id, onboardingProgress.employeeId, task.id, newStatus);
    const updatedProgress = updatedList.find((e) => e.employeeId === onboardingProgress.employeeId) || null;
    setOnboardingProgress(updatedProgress);
  };

  const handlePtoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPtoSubmitted(true);
    setTimeout(() => {
      setPtoSubmitted(false);
      setActiveTab('onboarding');
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Banner: Employee Welcome Card */}
      <div className="bg-gradient-to-r from-indigo-900/60 via-purple-900/50 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center space-x-4">
            <img
              src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80'}
              alt={currentUser.name}
              className="w-16 h-16 rounded-2xl border-2 border-indigo-400/50 object-cover shadow-md"
            />
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-white">Welcome, {currentUser.name}!</h1>
                <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full">
                  Onboarding New Hire
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                {currentUser.title || 'Team Member'} &bull; {tenant.name} ({currentUser.department || 'Engineering'})
              </p>
              {onboardingProgress?.assignedMentor && (
                <p className="text-[11px] text-indigo-300 mt-1">
                  Onboarding Mentor: <strong>{onboardingProgress.assignedMentor}</strong>
                </p>
              )}
            </div>
          </div>

          {/* Overall Progress Gauge */}
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl min-w-[220px]">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-400 font-medium">Onboarding Status</span>
              <span className="font-bold text-indigo-400">
                {onboardingProgress?.progressPercent || 60}%
              </span>
            </div>
            <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full transition-all duration-500"
                style={{ width: `${onboardingProgress?.progressPercent || 60}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1 text-right">
              {onboardingProgress?.tasks.filter((t) => t.completed).length || 3} of {onboardingProgress?.tasks.length || 5} tasks completed
            </p>
          </div>
        </div>
      </div>

      {/* View Toggle Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 overflow-x-auto scrollbar-none py-1">
        <button
          onClick={() => setActiveTab('onboarding')}
          className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 ${
            activeTab === 'onboarding'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Onboarding Checklist</span>
        </button>

        <button
          onClick={() => setActiveTab('kati_chat')}
          className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 ${
            activeTab === 'kati_chat'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>Ask Kati AI HR</span>
        </button>

        <button
          onClick={() => setActiveTab('policy_library')}
          className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 ${
            activeTab === 'policy_library'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <FileText className="w-4 h-4 text-purple-400 shrink-0" />
          <span>Company Policies</span>
        </button>

        <button
          onClick={() => setActiveTab('pto_form')}
          className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 ${
            activeTab === 'pto_form'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4 text-pink-400 shrink-0" />
          <span>Submit PTO Form</span>
        </button>
      </div>

      {/* Main Content Sections */}
      {activeTab === 'onboarding' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Interactive Task List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
              <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center space-x-2">
                    <UserCheck className="w-5 h-5 text-indigo-400" />
                    <span>Automated Onboarding Roadmap</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Complete these steps to unlock full benefits and equipment stipends.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {onboardingProgress?.tasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => handleTaskToggle(task)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start space-x-3.5 ${
                      task.completed
                        ? 'bg-slate-950/60 border-emerald-900/40 text-slate-400'
                        : 'bg-slate-900 border-slate-700 hover:border-indigo-500 text-slate-100'
                    }`}
                  >
                    <button className="mt-0.5 shrink-0 text-indigo-400">
                      {task.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-500" />
                      )}
                    </button>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${task.completed ? 'line-through text-slate-400' : 'text-slate-100'}`}>
                          {task.title}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Due in {task.dueDays} days
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{task.description}</p>

                      {task.requiresSignature && (
                        <div className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 text-[10px] font-semibold">
                          <PenTool className="w-3 h-3 text-indigo-400" />
                          <span>Requires Digital Signature</span>
                        </div>
                      )}

                      {task.completedAt && (
                        <p className="text-[10px] text-emerald-400/90 font-mono pt-1">
                          Completed on {task.completedAt}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Embedded Kati Assistant */}
          <div className="space-y-4">
            <KatiChatWidget tenant={tenant} currentUser={currentUser} />
          </div>
        </div>
      )}

      {activeTab === 'kati_chat' && (
        <div className="max-w-4xl mx-auto">
          <KatiChatWidget tenant={tenant} currentUser={currentUser} />
        </div>
      )}

      {activeTab === 'policy_library' && (
        <div className="space-y-4 max-w-5xl mx-auto">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <h2 className="text-lg font-bold text-white mb-2">{tenant.name} Official Policy Handbook</h2>
            <p className="text-xs text-slate-400">
              Below are the indexed policy documents that guide {tenant.name} guidelines and Kati AI HR responses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tenant.policies.map((p) => (
              <div key={p.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-300">{p.title}</span>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded">
                    {p.version}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-850">
                  {p.content}
                </p>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                  <span>Category: {p.category}</span>
                  <span>Effective: {p.effectiveDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'pto_form' && (
        <div className="max-w-xl mx-auto bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-indigo-400" />
            <span>Submit Paid Time Off (PTO) Request</span>
          </h2>

          {ptoSubmitted ? (
            <div className="p-6 bg-emerald-950/60 border border-emerald-800 rounded-xl text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h3 className="text-base font-bold text-emerald-200">PTO Request Submitted!</h3>
              <p className="text-xs text-emerald-300">
                Kati AI HR evaluated your request against {tenant.name}&apos;s PTO balance guidelines. Your manager has been notified.
              </p>
            </div>
          ) : (
            <form onSubmit={handlePtoSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Number of Leave Days</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={ptoDays}
                  onChange={(e) => setPtoDays(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Reason / Note</label>
                <textarea
                  rows={3}
                  value={ptoReason}
                  onChange={(e) => setPtoReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white"
                />
              </div>

              <div className="p-3 bg-indigo-950/40 border border-indigo-800/40 rounded-xl text-[11px] text-indigo-300">
                💡 Kati AI Policy Note: Standard PTO under 5 days is auto-approved instantly.
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all shadow-md flex items-center justify-center space-x-1.5"
              >
                <Send className="w-4 h-4" />
                <span>Submit Request to Kati Engine</span>
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
