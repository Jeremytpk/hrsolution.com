import React, { useState, useEffect } from 'react';
import { User, CompanyTenant } from './types';
import { fetchTenants, loginUser } from './services/api';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { SuperAdminDashboard } from './components/SuperAdminDashboard';
import { CompanyAdminDashboard } from './components/CompanyAdminDashboard';
import { EmployeeOnboardingPortal } from './components/EmployeeOnboardingPortal';
import { LanguageProvider } from './context/LanguageContext';

export default function App() {
  const [tenants, setTenants] = useState<CompanyTenant[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentTenant, setCurrentTenant] = useState<CompanyTenant | null>(null);
  const [currentView, setCurrentView] = useState<'landing' | 'super_admin' | 'company_admin' | 'employee_portal'>('landing');

  useEffect(() => {
    fetchTenants().then((list) => {
      setTenants(list);
    });
  }, []);

  const handleLoginByEmail = async (email: string) => {
    try {
      const res = await loginUser(email);
      setCurrentUser(res.user);
      setCurrentTenant(res.tenant);

      if (res.user.role === 'super_admin') {
        setCurrentView('super_admin');
      } else if (res.user.role === 'company_admin') {
        setCurrentView('company_admin');
      } else if (res.user.role === 'employee') {
        setCurrentView('employee_portal');
      }
    } catch (err: any) {
      alert(err.message || 'Login failed');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentTenant(null);
    setCurrentView('landing');
  };

  const handleRegisterTenant = (newTenantData: Partial<CompanyTenant>) => {
    setTenants((prev) => [...prev, newTenantData as CompanyTenant]);
  };

  const handleUpdateTenantState = (updated: CompanyTenant) => {
    setTenants((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    if (currentTenant?.id === updated.id) {
      setCurrentTenant(updated);
    }
  };

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        <Navbar
          currentUser={currentUser}
          currentTenant={currentTenant}
          currentView={currentView}
          onNavigate={setCurrentView}
          onLogout={handleLogout}
          onSelectDemoUser={handleLoginByEmail}
        />

        <main className="flex-1">
          {currentView === 'landing' && (
            <LandingPage
              tenants={tenants}
              onLoginEmail={handleLoginByEmail}
              onRegisterTenant={handleRegisterTenant}
            />
          )}

          {currentView === 'super_admin' && currentUser?.role === 'super_admin' && (
            <SuperAdminDashboard
              tenants={tenants}
              currentUser={currentUser}
              onTenantCreated={(newT) => setTenants((prev) => [...prev, newT])}
              onTenantUpdated={handleUpdateTenantState}
            />
          )}

          {currentView === 'company_admin' && currentUser && currentTenant && (
            <CompanyAdminDashboard
              tenant={currentTenant}
              currentUser={currentUser}
              onUpdateTenantState={handleUpdateTenantState}
            />
          )}

          {currentView === 'employee_portal' && currentUser && currentTenant && (
            <EmployeeOnboardingPortal
              tenant={currentTenant}
              currentUser={currentUser}
            />
          )}
        </main>
      </div>
    </LanguageProvider>
  );
}

