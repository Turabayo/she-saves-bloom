import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'fr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    // Navigation
    dashboard: 'Dashboard',
    goals: 'Goals',
    insights: 'Insights',
    signOut: 'Sign Out',
    
    // Settings
    settings: 'Settings',
    profile: 'Profile',
    password: 'Password',
    changePassword: 'Change Password',
    language: 'Language',
    aiAssistant: 'AI Assistant',
    aiAssistantDesc: 'Enable financial AI assistance everywhere',
    exportSavingsHistory: 'Export Savings History',
    helpSupport: 'Help & Support',
    
    // Password Change
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    confirmPassword: 'Confirm New Password',
    updatePassword: 'Update Password',
    cancel: 'Cancel',
    
    // Language Selection
    english: 'English',
    french: 'Français',
    selectLanguage: 'Select Language',
    
    // Export & Help
    exportSuccess: 'Export completed successfully',
    exportError: 'Error generating export',
    helpTitle: 'How to Use SheSaves',
    helpContent: 'SheSaves helps you manage your savings and investments. Navigate through different sections using the menu, add investments, track your progress, and get AI-powered insights.',
    
    // Toasts
    passwordUpdated: 'Password updated successfully',
    passwordError: 'Error updating password',
    languageChanged: 'Language changed successfully',
    aiEnabled: 'AI Assistant Enabled',
    aiDisabled: 'AI Assistant Disabled',
    aiEnabledDesc: 'AI Assistant is now active',
    aiDisabledDesc: 'AI Assistant has been turned off',
    signOutSuccess: 'Signed out successfully',
    signOutDesc: 'You have been logged out of your account',
  },
  fr: {
    // Navigation
    dashboard: 'Tableau de bord',
    goals: 'Objectifs',
    insights: 'Analyses',
    signOut: 'Déconnexion',
    
    // Settings
    settings: 'Paramètres',
    profile: 'Profil',
    password: 'Mot de passe',
    changePassword: 'Changer le mot de passe',
    language: 'Langue',
    aiAssistant: 'Assistant IA',
    aiAssistantDesc: 'Activer l\'assistance IA financière partout',
    exportSavingsHistory: 'Exporter l\'historique d\'épargne',
    helpSupport: 'Aide et support',
    
    // Password Change
    currentPassword: 'Mot de passe actuel',
    newPassword: 'Nouveau mot de passe',
    confirmPassword: 'Confirmer le nouveau mot de passe',
    updatePassword: 'Mettre à jour le mot de passe',
    cancel: 'Annuler',
    
    // Language Selection
    english: 'English',
    french: 'Français',
    selectLanguage: 'Sélectionner la langue',
    
    // Export & Help
    exportSuccess: 'Export terminé avec succès',
    exportError: 'Erreur lors de la génération de l\'export',
    helpTitle: 'Comment utiliser SheSaves',
    helpContent: 'SheSaves vous aide à gérer vos économies et investissements. Naviguez dans les différentes sections en utilisant le menu, ajoutez des investissements, suivez vos progrès et obtenez des analyses alimentées par l\'IA.',
    
    // Toasts
    passwordUpdated: 'Mot de passe mis à jour avec succès',
    passwordError: 'Erreur lors de la mise à jour du mot de passe',
    languageChanged: 'Langue changée avec succès',
    aiEnabled: 'Assistant IA activé',
    aiDisabled: 'Assistant IA désactivé',
    aiEnabledDesc: 'L\'assistant IA est maintenant actif',
    aiDisabledDesc: 'L\'assistant IA a été désactivé',
    signOutSuccess: 'Déconnexion réussie',
    signOutDesc: 'Vous avez été déconnecté de votre compte',
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'fr')) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};