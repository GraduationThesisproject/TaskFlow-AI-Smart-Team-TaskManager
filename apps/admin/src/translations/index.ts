import { Language } from '../hooks/useLanguage';

export interface Translations {
  common: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    loading: string;
    error: string;
    success: string;
    confirm: string;
    back: string;
    next: string;
    previous: string;
    search: string;
    filter: string;
    refresh: string;
    settings: string;
    profile: string;
    logout: string;
  };
  logout: {
    confirmTitle: string;
    confirmMessage: string;
    cancelButton: string;
    confirmButton: string;
  };
  navigation: {
    dashboard: string;
    usersAndRoles: string;
    templates: string;
    analytics: string;
    integrations: string;
    systemHealth: string;
    notifications: string;
    settings: string;
  };
  settings: {
    general: string;
    security: string;
    notifications: string;
    appearance: string;
    language: string;
    theme: string;
    timezone: string;
    companyName: string;
    saveSettings: string;
    settingsSaved: string;
    generalSettings: string;
    securitySettings: string;
    notificationSettings: string;
  };
  dashboard: {
    overview: string;
    keyMetrics: string;
    recentActivity: string;
    systemStatus: string;
    totalUsers: string;
    activeUsers: string;
    totalProjects: string;
    activeProjects: string;
  };
  userManagement: {
    manageUsers: string;
    userAccounts: string;
    permissions: string;
    roles: string;
    addUser: string;
    editUser: string;
    deleteUser: string;
    userRole: string;
    lastLogin: string;
    status: string;
  };
}

const translations: Record<Language, Translations> = {
  en: {
    common: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      confirm: 'Confirm',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      search: 'Search',
      filter: 'Filter',
      refresh: 'Refresh',
      settings: 'Settings',
      profile: 'Profile',
      logout: 'Logout',
    },
    logout: {
      confirmTitle: 'Confirm Logout',
      confirmMessage: 'Are you sure you want to log out? You will be redirected to the login page.',
      cancelButton: 'Cancel',
      confirmButton: 'Logout',
    },
    navigation: {
      dashboard: 'Dashboard',
      usersAndRoles: 'Users & Roles',
      templates: 'Templates',
      analytics: 'Analytics',
      integrations: 'Integrations',
      systemHealth: 'System Health',
      notifications: 'Notifications',
      settings: 'Settings',
    },
    settings: {
      general: 'General',
      security: 'Security',
      notifications: 'Notifications',
      appearance: 'Appearance',
      language: 'Language',
      theme: 'Theme',
      timezone: 'Timezone',
      companyName: 'Company Name',
      saveSettings: 'Save Settings',
      settingsSaved: 'Settings saved successfully!',
      generalSettings: 'General Settings',
      securitySettings: 'Security Settings',
      notificationSettings: 'Notification Settings',
    },
    dashboard: {
      overview: 'Overview',
      keyMetrics: 'Key Metrics',
      recentActivity: 'Recent Activity',
      systemStatus: 'System Status',
      totalUsers: 'Total Users',
      activeUsers: 'Active Users',
      totalProjects: 'Total Projects',
      activeProjects: 'Active Projects',
    },
    userManagement: {
      manageUsers: 'Manage Users',
      userAccounts: 'User Accounts',
      permissions: 'Permissions',
      roles: 'Roles',
      addUser: 'Add User',
      editUser: 'Edit User',
      deleteUser: 'Delete User',
      userRole: 'User Role',
      lastLogin: 'Last Login',
      status: 'Status',
    },
  },
  es: {
    common: {
      save: 'Guardar',
      cancel: 'Cancelar',
      delete: 'Eliminar',
      edit: 'Editar',
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito',
      confirm: 'Confirmar',
      back: 'Atrás',
      next: 'Siguiente',
      previous: 'Anterior',
      search: 'Buscar',
      filter: 'Filtrar',
      refresh: 'Actualizar',
      settings: 'Configuración',
      profile: 'Perfil',
      logout: 'Cerrar sesión',
    },
    logout: {
      confirmTitle: 'Confirmar Cierre de Sesión',
      confirmMessage: '¿Estás seguro de que quieres cerrar sesión? Serás redirigido a la página de inicio de sesión.',
      cancelButton: 'Cancelar',
      confirmButton: 'Cerrar Sesión',
    },
    navigation: {
      dashboard: 'Panel de control',
      usersAndRoles: 'Usuarios y Roles',
      templates: 'Plantillas',
      analytics: 'Analíticas',
      integrations: 'Integraciones',
      systemHealth: 'Salud del Sistema',
      notifications: 'Notificaciones',
      settings: 'Configuración',
    },
    settings: {
      general: 'General',
      security: 'Seguridad',
      notifications: 'Notificaciones',
      appearance: 'Apariencia',
      language: 'Idioma',
      theme: 'Tema',
      timezone: 'Zona horaria',
      companyName: 'Nombre de la empresa',
      saveSettings: 'Guardar configuración',
      settingsSaved: '¡Configuración guardada exitosamente!',
      generalSettings: 'Configuración general',
      securitySettings: 'Configuración de seguridad',
      notificationSettings: 'Configuración de notificaciones',
    },
    dashboard: {
      overview: 'Resumen',
      keyMetrics: 'Métricas clave',
      recentActivity: 'Actividad reciente',
      systemStatus: 'Estado del sistema',
      totalUsers: 'Total de usuarios',
      activeUsers: 'Usuarios activos',
      totalProjects: 'Total de proyectos',
      activeProjects: 'Proyectos activos',
    },
    userManagement: {
      manageUsers: 'Gestionar usuarios',
      userAccounts: 'Cuentas de usuario',
      permissions: 'Permisos',
      roles: 'Roles',
      addUser: 'Agregar usuario',
      editUser: 'Editar usuario',
      deleteUser: 'Eliminar usuario',
      userRole: 'Rol de usuario',
      lastLogin: 'Último acceso',
      status: 'Estado',
    },
  },
  fr: {
    common: {
      save: 'Enregistrer',
      cancel: 'Annuler',
      delete: 'Supprimer',
      edit: 'Modifier',
      loading: 'Chargement...',
      error: 'Erreur',
      success: 'Succès',
      confirm: 'Confirmer',
      back: 'Retour',
      next: 'Suivant',
      previous: 'Précédent',
      search: 'Rechercher',
      filter: 'Filtrer',
      refresh: 'Actualiser',
      settings: 'Paramètres',
      profile: 'Profil',
      logout: 'Déconnexion',
    },
    logout: {
      confirmTitle: 'Confirmer la Déconnexion',
      confirmMessage: 'Êtes-vous sûr de vouloir vous déconnecter ? Vous serez redirigé vers la page de connexion.',
      cancelButton: 'Annuler',
      confirmButton: 'Se Déconnecter',
    },
    navigation: {
      dashboard: 'Tableau de bord',
      usersAndRoles: 'Utilisateurs et Rôles',
      templates: 'Modèles',
      analytics: 'Analyses',
      integrations: 'Intégrations',
      systemHealth: 'Santé du système',
      notifications: 'Notifications',
      settings: 'Paramètres',
    },
    settings: {
      general: 'Général',
      security: 'Sécurité',
      notifications: 'Notifications',
      appearance: 'Apparence',
      language: 'Langue',
      theme: 'Thème',
      timezone: 'Fuseau horaire',
      companyName: 'Nom de l\'entreprise',
      saveSettings: 'Enregistrer les paramètres',
      settingsSaved: 'Paramètres enregistrés avec succès !',
      generalSettings: 'Paramètres généraux',
      securitySettings: 'Paramètres de sécurité',
      notificationSettings: 'Paramètres de notification',
    },
    dashboard: {
      overview: 'Aperçu',
      keyMetrics: 'Métriques clés',
      recentActivity: 'Activité récente',
      systemStatus: 'État du système',
      totalUsers: 'Total des utilisateurs',
      activeUsers: 'Utilisateurs actifs',
      totalProjects: 'Total des projets',
      activeProjects: 'Projets actifs',
    },
    userManagement: {
      manageUsers: 'Gérer les utilisateurs',
      userAccounts: 'Comptes utilisateur',
      permissions: 'Permissions',
      roles: 'Rôles',
      addUser: 'Ajouter un utilisateur',
      editUser: 'Modifier l\'utilisateur',
      deleteUser: 'Supprimer l\'utilisateur',
      userRole: 'Rôle utilisateur',
      lastLogin: 'Dernière connexion',
      status: 'Statut',
    },
  },
  de: {
    common: {
      save: 'Speichern',
      cancel: 'Abbrechen',
      delete: 'Löschen',
      edit: 'Bearbeiten',
      loading: 'Lädt...',
      error: 'Fehler',
      success: 'Erfolg',
      confirm: 'Bestätigen',
      back: 'Zurück',
      next: 'Weiter',
      previous: 'Zurück',
      search: 'Suchen',
      filter: 'Filter',
      refresh: 'Aktualisieren',
      settings: 'Einstellungen',
      profile: 'Profil',
      logout: 'Abmelden',
    },
    logout: {
      confirmTitle: 'Abmeldung Bestätigen',
      confirmMessage: 'Sind Sie sicher, dass Sie sich abmelden möchten? Sie werden zur Anmeldeseite weitergeleitet.',
      cancelButton: 'Abbrechen',
      confirmButton: 'Abmelden',
    },
    navigation: {
      dashboard: 'Dashboard',
      usersAndRoles: 'Benutzer & Rollen',
      templates: 'Vorlagen',
      analytics: 'Analysen',
      integrations: 'Integrationen',
      systemHealth: 'Systemstatus',
      notifications: 'Benachrichtigungen',
      settings: 'Einstellungen',
    },
    settings: {
      general: 'Allgemein',
      security: 'Sicherheit',
      notifications: 'Benachrichtigungen',
      appearance: 'Erscheinungsbild',
      language: 'Sprache',
      theme: 'Design',
      timezone: 'Zeitzone',
      companyName: 'Firmenname',
      saveSettings: 'Einstellungen speichern',
      settingsSaved: 'Einstellungen erfolgreich gespeichert!',
      generalSettings: 'Allgemeine Einstellungen',
      securitySettings: 'Sicherheitseinstellungen',
      notificationSettings: 'Benachrichtigungseinstellungen',
    },
    dashboard: {
      overview: 'Übersicht',
      keyMetrics: 'Wichtige Kennzahlen',
      recentActivity: 'Letzte Aktivität',
      systemStatus: 'Systemstatus',
      totalUsers: 'Benutzer insgesamt',
      activeUsers: 'Aktive Benutzer',
      totalProjects: 'Projekte insgesamt',
      activeProjects: 'Aktive Projekte',
    },
    userManagement: {
      manageUsers: 'Benutzer verwalten',
      userAccounts: 'Benutzerkonten',
      permissions: 'Berechtigungen',
      roles: 'Rollen',
      addUser: 'Benutzer hinzufügen',
      editUser: 'Benutzer bearbeiten',
      deleteUser: 'Benutzer löschen',
      userRole: 'Benutzerrolle',
      lastLogin: 'Letzter Login',
      status: 'Status',
    },
  },
};

export function getTranslation(language: Language): Translations {
  return translations[language] || translations.en;
}

export function t(language: Language, key: string): string {
  const translation = getTranslation(language);
  const keys = key.split('.');
  let value: any = translation;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return key; // Return key if translation not found
    }
  }
  
  return typeof value === 'string' ? value : key;
}
