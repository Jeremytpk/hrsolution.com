import React from 'react';
import { User, CompanyTenant } from '../types';
import { ShieldCheck, Building2, UserCheck, LogOut, Globe, Lock } from 'lucide-react';
import katiLogo from '../assets/KatiAiLogo1.png';
import { useLanguage } from '../context/LanguageContext';

interface NavbarProps {
  currentUser: User | null;
  currentTenant: CompanyTenant | null;
  currentView: 'landing' | 'super_admin' | 'company_admin' | 'employee_portal';
  onNavigate: (view: 'landing' | 'super_admin' | 'company_admin' | 'employee_portal') => void;
  onLogout: () => void;
  onSelectDemoUser: (email: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  currentTenant,
  currentView,
  onNavigate,
  onLogout,
  onSelectDemoUser,
}) => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 text-slate-100 shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center cursor-pointer shrink-0" onClick={() => onNavigate('landing')}>
          <img
            src={katiLogo}
            alt="Kati AI Logo"
            className="h-[38px] sm:h-[55px] w-auto object-contain max-h-[65px] rounded-[7px]"
            style={{ borderRadius: '7px' }}
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Center: Tenant Data Isolation & Current Scope Indicator */}
        {currentUser && (
          <div className="hidden md:flex items-center space-x-2 bg-slate-950 border border-slate-800 px-3.5 py-2 rounded-xl text-xs">
            <Lock className="w-3.5 h-3.5 text-teal-400" />
            <span className="text-slate-400 font-medium">{t('nav.tenantShard', 'Tenant Shard')}:</span>
            <span className="font-bold text-slate-200">
              {currentUser.role === 'super_admin' ? 'Global Kati Central' : currentTenant?.name || 'Company Domain'}
            </span>
            {currentTenant && (
              <span className="font-mono text-[10px] text-teal-400 bg-teal-950/80 px-2 py-0.5 rounded border border-teal-800/60 font-bold">
                {currentTenant.isolatedEncryptionKeyId.substring(0, 16)}...
              </span>
            )}
          </div>
        )}

        {/* Right Controls */}
        <div className="flex items-center space-x-1.5 sm:space-x-3">
          {/* Global System Language Switcher */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-0.5 sm:p-1 text-xs">
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-2 py-1 sm:px-2.5 rounded-lg font-bold transition-all flex items-center space-x-1 ${
                language === 'en'
                  ? 'bg-teal-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Switch system language to English"
            >
              <span>🇬🇧</span>
              <span className="hidden sm:inline">EN</span>
            </button>
            <button
              type="button"
              onClick={() => setLanguage('fr')}
              className={`px-2 py-1 sm:px-2.5 rounded-lg font-bold transition-all flex items-center space-x-1 ${
                language === 'fr'
                  ? 'bg-teal-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Passer la langue du système en français"
            >
              <span>🇫🇷</span>
              <span className="hidden sm:inline">FR</span>
            </button>
          </div>

          {currentUser ? (
            <div className="flex items-center space-x-1.5 sm:space-x-3">
              {/* Role Navigation Button */}
              {currentUser.role === 'super_admin' && (
                <button
                  onClick={() => onNavigate('super_admin')}
                  title={t('nav.centralAdmin', 'Central Admin')}
                  className={`p-2 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all ${
                    currentView === 'super_admin'
                      ? 'bg-teal-500 text-slate-950 shadow-md font-extrabold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-teal-900 shrink-0" />
                  <span className="hidden sm:inline">{t('nav.centralAdmin', 'Central Admin')}</span>
                </button>
              )}

              {currentUser.role === 'company_admin' && (
                <button
                  onClick={() => onNavigate('company_admin')}
                  title={t('nav.hrAdmin', 'HR Admin Dashboard')}
                  className={`p-2 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all ${
                    currentView === 'company_admin'
                      ? 'bg-teal-500 text-slate-950 shadow-md font-extrabold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-slate-900 shrink-0" />
                  <span className="hidden sm:inline">{t('nav.hrAdmin', 'HR Admin Dashboard')}</span>
                </button>
              )}

              {currentUser.role === 'employee' && (
                <button
                  onClick={() => onNavigate('employee_portal')}
                  title={t('nav.employeePortal', 'My Employee Onboarding')}
                  className={`p-2 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all ${
                    currentView === 'employee_portal'
                      ? 'bg-teal-500 text-slate-950 shadow-md font-extrabold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                  }`}
                >
                  <UserCheck className="w-4 h-4 text-slate-900 shrink-0" />
                  <span className="hidden sm:inline">{t('nav.employeePortal', 'My Employee Onboarding')}</span>
                </button>
              )}

              {/* User Profile Info */}
              <div className="flex items-center space-x-2 pl-1.5 sm:pl-3 border-l border-slate-800">
                <img
                  src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'}
                  alt={currentUser.name}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border-2 border-teal-500/40 object-cover shadow-sm"
                />
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-bold text-slate-100 leading-tight">{currentUser.name}</p>
                  <p className="text-[10px] text-teal-400 font-bold capitalize">{currentUser.role.replace('_', ' ')}</p>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={onLogout}
                title={t('nav.logout', 'Log out')}
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-colors border border-transparent hover:border-slate-700"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onNavigate('landing')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-md transition-all flex items-center space-x-1.5"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Landing Page</span>
              </button>
              <button
                onClick={() => onSelectDemoUser('admin@hrsolution.com')}
                className="hidden sm:inline-flex px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              >
                {t('nav.switchUser', '1-Click Demo Logins')}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

