import React, { createContext, useContext, useState } from 'react';

export type Language = 'en' | 'fr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Nav
    'nav.centralAdmin': 'Central Admin',
    'nav.hrAdmin': 'HR Admin Dashboard',
    'nav.employeePortal': 'My Employee Onboarding',
    'nav.logout': 'Logout',
    'nav.switchUser': 'Switch Demo Account',
    'nav.tenantShard': 'Tenant Shard',
    
    // Super Admin
    'super.title': 'Central Kati Platform Management Portal',
    'super.provisionTenant': '+ Provision New Company Tenant',
    'super.tabTenants': 'Client Tenants',
    'super.tabSecurity': 'Security & Encryption',
    'super.tabAnalytics': 'Platform Analytics',
    'super.tabPrompts': 'Prompt Engineering',
    'super.manageAccess': 'Delegated Permissions',
    'super.editBasicInfo': 'Edit Basic Info',
    'super.managePersona': 'Kati Persona',
    'super.viewDetail': 'View Full Company Detail',
    'super.addPolicyPerm': "Display 'Add Policy Document' Button",
    'super.addPolicyPermDesc': "Allows Company Admin to see the '+ Add Policy Document' button and upload new HR policy documents.",

    // Company Admin
    'company.editInfo': 'Edit Company Info',
    'company.kmsKey': 'Verification KMS Key (Super Admin Verification)',
    'company.copyKey': 'Copy Key',
    'company.copied': 'Copied!',
    'company.profileDetails': 'Company Profile Details',
    'company.tabAnalytics': 'Analytics',
    'company.tabPolicies': 'Policy Base',
    'company.tabPersona': 'Kati Persona',
    'company.tabOnboarding': 'Onboarding Checklist',
    'company.tabPlayground': 'AI Policy Playground',
    'company.addPolicyBtn': '+ Add Policy Document',
    'company.addPolicyTitle': 'Add New Policy Document',
    'company.editPolicyBtn': 'Edit Policy',
    'company.deletePolicyBtn': 'Delete Policy',
    'company.policyCategory': 'Category',
    'company.policyTitle': 'Policy Title',
    'company.policyContent': 'Policy Content',
    'company.policyVersion': 'Version Tag',
    'company.registerHire': '+ Register New Hired Employee',

    // Employee Portal
    'employee.welcome': 'Welcome to your Employee Portal',
    'employee.aiAssistant': 'Kati AI HR Assistant',
    'employee.askPlaceholder': 'Ask Kati anything about PTO, benefits, or company policies...',
    'employee.checklist': 'Your Onboarding Action Checklist',
    'employee.completed': 'Completed',
    'employee.pending': 'Pending Action',

    // Common
    'common.save': 'Save Changes',
    'common.cancel': 'Cancel',
    'common.close': 'Close',
    'common.search': 'Search...',
  },
  fr: {
    // Nav
    'nav.centralAdmin': 'Admin Central',
    'nav.hrAdmin': 'Tableau de Bord RH',
    'nav.employeePortal': 'Mon Intégration',
    'nav.logout': 'Déconnexion',
    'nav.switchUser': 'Changer de compte démo',
    'nav.tenantShard': 'Espace Client',

    // Super Admin
    'super.title': 'Portail Central de Gestion Kati Platform',
    'super.provisionTenant': '+ Créer une Nouvelle Entreprise',
    'super.tabTenants': 'Entreprises Clientes',
    'super.tabSecurity': 'Sécurité & Chiffrement',
    'super.tabAnalytics': 'Analytiques Plateforme',
    'super.tabPrompts': 'Ingénierie de Prompts',
    'super.manageAccess': 'Permissions Déléguées',
    'super.editBasicInfo': 'Modifier Infos de Base',
    'super.managePersona': 'Persona Kati',
    'super.viewDetail': 'Détails de l\'Entreprise',
    'super.addPolicyPerm': "Afficher le bouton 'Ajouter un Document de Politique'",
    'super.addPolicyPermDesc': "Permet à l'Admin d'entreprise de voir le bouton '+ Ajouter un Document' et de téléverser de nouvelles politiques.",

    // Company Admin
    'company.editInfo': 'Modifier Infos Entreprise',
    'company.kmsKey': 'Clé KMS de Vérification (Vérification Super Admin)',
    'company.copyKey': 'Copier la Clé',
    'company.copied': 'Copié !',
    'company.profileDetails': 'Détails du Profil de l\'Entreprise',
    'company.tabAnalytics': 'Analytiques',
    'company.tabPolicies': 'Base de Politiques',
    'company.tabPersona': 'Persona Kati',
    'company.tabOnboarding': 'Liste d\'Intégration',
    'company.tabPlayground': 'Bac à Sable IA',
    'company.addPolicyBtn': '+ Ajouter un Document de Politique',
    'company.addPolicyTitle': 'Ajouter une Nouvelle Politique RH',
    'company.editPolicyBtn': 'Modifier la Politique',
    'company.deletePolicyBtn': 'Supprimer la Politique',
    'company.policyCategory': 'Catégorie',
    'company.policyTitle': 'Titre de la Politique',
    'company.policyContent': 'Contenu de la Politique',
    'company.policyVersion': 'Version',
    'company.registerHire': '+ Enregistrer un Nouvel Employé',

    // Employee Portal
    'employee.welcome': 'Bienvenue sur votre Portail Employé',
    'employee.aiAssistant': 'Assistant IA RH Kati',
    'employee.askPlaceholder': 'Posez vos questions à Kati sur les congés, avantages ou politiques...',
    'employee.checklist': 'Votre Liste d\'Actions d\'Intégration',
    'employee.completed': 'Terminé',
    'employee.pending': 'En attente',

    // Common
    'common.save': 'Enregistrer',
    'common.cancel': 'Annuler',
    'common.close': 'Fermer',
    'common.search': 'Rechercher...',
  },
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string, fallback?: string) => fallback || key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string, fallback?: string): string => {
    return translations[language]?.[key] || fallback || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
