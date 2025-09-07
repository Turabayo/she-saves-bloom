import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'fr' | 'rw';

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
    incomeExpenseTracker: 'Income & Expense Tracker',
    income: 'Income',
    expenses: 'Expenses',
    
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
    helpTitle: 'How to Use ISave',
    helpContent: 'ISave helps you manage your personal finances. Track income, expenses, and savings goals while getting AI-powered insights for your financial journey.',
    
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
    
    // Income & Expense Tracker
    addIncome: 'Add Income',
    source: 'Source',
    incomeSourcePlaceholder: 'Salary, freelance, business...',
    incomeHistory: 'Income History',
    noIncomeRecorded: 'No income recorded yet',
    addFirstIncome: 'Add your first income',
    adding: 'Adding...',
    noteOptional: 'Add a note (optional)',
    optional: 'optional',
    
    // Scheduled Savings
    scheduledSavings: 'Scheduled Savings',
    noScheduledSavings: 'No scheduled savings yet',
    createSchedule: 'Create Schedule',
    upcomingThisWeek: 'upcoming this week',
    more: 'more',
    createScheduledSaving: 'Create Scheduled Saving',
    savingName: 'Saving Name',
    savingNamePlaceholder: 'Emergency fund, vacation...',
    frequency: 'Frequency',
    weekly: 'Weekly',
    monthly: 'Monthly',
    oneTime: 'One-time',
    linkedGoal: 'Linked Goal',
    selectGoal: 'Select a goal',
    noGoal: 'No specific goal',
    nextExecutionDate: 'Next Execution Date',
    creating: 'Creating...',
    
    // Voice Input
    recordingStarted: 'Recording Started',
    speakNow: 'Speak now...',
    error: 'Error',
    microphoneAccessDenied: 'Microphone access denied',
    transcriptionComplete: 'Transcription Complete',
    voiceProcessed: 'Voice input processed successfully',
    voiceProcessingFailed: 'Failed to process voice input',
    
    // AI Tips
    aiTip: 'AI Financial Tip',
    dailyTip: 'Daily Financial Tip',
    
    // General
    amount: 'Amount',
    date: 'Date',
    note: 'Note',
  },
  fr: {
    // Navigation
    dashboard: 'Tableau de bord',
    goals: 'Objectifs',
    insights: 'Analyses',
    signOut: 'Déconnexion',
    incomeExpenseTracker: 'Suivi Revenus et Dépenses',
    income: 'Revenus',
    expenses: 'Dépenses',
    
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
    helpTitle: 'Comment utiliser ISave',
    helpContent: 'ISave vous aide à gérer vos finances personnelles. Suivez vos revenus, dépenses et objectifs d\'épargne tout en obtenant des informations alimentées par l\'IA.',
    
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
    
    // Income & Expense Tracker
    addIncome: 'Ajouter Revenu',
    source: 'Source',
    incomeSourcePlaceholder: 'Salaire, freelance, entreprise...',
    incomeHistory: 'Historique des Revenus',
    noIncomeRecorded: 'Aucun revenu enregistré',
    addFirstIncome: 'Ajouter votre premier revenu',
    adding: 'Ajout...',
    noteOptional: 'Ajouter une note (optionnel)',
    optional: 'optionnel',
    
    // Scheduled Savings
    scheduledSavings: 'Épargne Programmée',
    noScheduledSavings: 'Aucune épargne programmée',
    createSchedule: 'Créer Planning',
    upcomingThisWeek: 'à venir cette semaine',
    more: 'plus',
    createScheduledSaving: 'Créer Épargne Programmée',
    savingName: 'Nom de l\'épargne',
    savingNamePlaceholder: 'Fonds d\'urgence, vacances...',
    frequency: 'Fréquence',
    weekly: 'Hebdomadaire',
    monthly: 'Mensuel',
    oneTime: 'Une fois',
    linkedGoal: 'Objectif Lié',
    selectGoal: 'Sélectionner un objectif',
    noGoal: 'Aucun objectif spécifique',
    nextExecutionDate: 'Prochaine Date d\'Exécution',
    creating: 'Création...',
    
    // Voice Input
    recordingStarted: 'Enregistrement Démarré',
    speakNow: 'Parlez maintenant...',
    error: 'Erreur',
    microphoneAccessDenied: 'Accès au microphone refusé',
    transcriptionComplete: 'Transcription Terminée',
    voiceProcessed: 'Entrée vocale traitée avec succès',
    voiceProcessingFailed: 'Échec du traitement de l\'entrée vocale',
    
    // AI Tips
    aiTip: 'Conseil IA Financier',
    dailyTip: 'Conseil Financier du Jour',
    
    // General
    amount: 'Montant',
    date: 'Date',
    note: 'Note',
  },
  rw: {
    // Navigation
    dashboard: 'Ikigega',
    goals: 'Intego',
    insights: 'Isesengura',
    signOut: 'Sohoka',
    incomeExpenseTracker: 'Gukurikirana Inyungu n\'Amafaranga',
    income: 'Inyungu',
    expenses: 'Amafaranga',
    
    // Settings
    settings: 'Igenamiterere',
    profile: 'Umwirondoro',
    password: 'Ijambobanga',
    changePassword: 'Guhindura Ijambobanga',
    language: 'Ururimi',
    aiAssistant: 'Umufasha wa AI',
    aiAssistantDesc: 'Gushyira muri gahunda ubufasha bwa AI mu bicuruzwa',
    exportSavingsHistory: 'Kohereza Amateka y\'Ikigega',
    helpSupport: 'Ubufasha na Gushyigikira',
    
    // Password Change
    currentPassword: 'Ijambobanga Rikorwa',
    newPassword: 'Ijambobanga Rishya',
    confirmPassword: 'Emeza Ijambobanga Rishya',
    updatePassword: 'Kuvugurura Ijambobanga',
    cancel: 'Kureka',
    
    // Language Selection
    english: 'Icyongereza',
    french: 'Igifaransa',
    selectLanguage: 'Hitamo Ururimi',
    
    // Export & Help
    exportSuccess: 'Ukohereza rwagenze neza',
    exportError: 'Ikosa mu gukora ukohereza',
    helpTitle: 'Uko ukoresha ISave',
    helpContent: 'ISave ikugufasha gucunga amafaranga yawe yihariye. Kurikirane amafaranga yinjira, ayasohoka n\'intego zo kuzigama ubona n\'ubushakashatsi bwa AI.',
    
    // Toasts
    passwordUpdated: 'Ijambobanga ryavuguruwe neza',
    passwordError: 'Ikosa mu kuvugurura ijambobanga',
    languageChanged: 'Ururimi rwahinduwe neza',
    aiEnabled: 'Umufasha wa AI yashyizwe',
    aiDisabled: 'Umufasha wa AI yahagaritswe',
    aiEnabledDesc: 'Umufasha wa AI urakora',
    aiDisabledDesc: 'Umufasha wa AI wahagaritswe',
    signOutSuccess: 'Wasohokye neza',
    signOutDesc: 'Wasohokye muri konti yawe',
    
    // Income & Expense Tracker
    addIncome: 'Ongeramo Inyungu',
    source: 'Inkomoko',
    incomeSourcePlaceholder: 'Umushahara, akazi gato, ubucuruzi...',
    incomeHistory: 'Amateka y\'Inyungu',
    noIncomeRecorded: 'Nta nyungu zanditswe',
    addFirstIncome: 'Ongeramo inyungu yawe ya mbere',
    adding: 'Ugongera...',
    noteOptional: 'Ongeraho incamake (bitari ngombwa)',
    optional: 'bitari ngombwa',
    
    // Scheduled Savings
    scheduledSavings: 'Ikigega Cyateganyijwe',
    noScheduledSavings: 'Nta kigega cyateganyijwe',
    createSchedule: 'Kora Gahunda',
    upcomingThisWeek: 'bizaza muri iki cyumweru',
    more: 'byandi',
    createScheduledSaving: 'Kora Ikigega Cyateganyijwe',
    savingName: 'Izina ry\'Ikigega',
    savingNamePlaceholder: 'Amafaranga y\'ubuhungiro, urugendo...',
    frequency: 'Ibikurikirana',
    weekly: 'Icyumweru',
    monthly: 'Ukwezi',
    oneTime: 'Inshuro imwe',
    linkedGoal: 'Intego Ifitanye Isano',
    selectGoal: 'Hitamo intego',
    noGoal: 'Nta ntego yihariye',
    nextExecutionDate: 'Itariki Ikurikira y\'Ubwikorezi',
    creating: 'Urakora...',
    
    // Voice Input
    recordingStarted: 'Gufata Amajwi Byatangiye',
    speakNow: 'Vuga ubu...',
    error: 'Ikosa',
    microphoneAccessDenied: 'Ukwemerera kwa mikrofone kwanze',
    transcriptionComplete: 'Guhindura Amajwi mu Nyandiko Byarangiye',
    voiceProcessed: 'Injiza y\'ijwi yakoreshejwe neza',
    voiceProcessingFailed: 'Gukoresha injiza y\'ijwi byanze',
    
    // AI Tips
    aiTip: 'Inama za AI ku Bicuruzwa',
    dailyTip: 'Inama ya Buri munsi ku Bicuruzwa',
    
    // General
    amount: 'Umubare',
    date: 'Itariki',
    note: 'Incamake',
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'fr' || savedLanguage === 'rw')) {
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