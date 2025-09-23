import { PersistConfig } from 'redux-persist';

export const PERSIST_VERSION = 2;

export const persistMigrations = {
  // Migration from version 0 to 1
  1: (state: any) => {
    console.log('Running persist migration from version 0 to 1');
    return {
      ...state,
      // Add any migration logic here if needed
    };
  },
  // Migration from version 1 to 2 - Archive workspace persistence
  2: (state: any) => {
    console.log('Running persist migration from version 1 to 2 - Archive workspace persistence');
    
    if (state?.workspace?.workspaces) {
      const now = Date.now();
      const updatedWorkspaces = state.workspace.workspaces.map((workspace: any) => {
        // If workspace is archived and has archiveExpiresAt, ensure it stays archived
        if (workspace.status === 'archived' && workspace.archiveExpiresAt) {
          const archiveExpiry = new Date(workspace.archiveExpiresAt).getTime();
          // If archive period has expired, keep it archived but don't auto-restore
          if (archiveExpiry <= now) {
            return {
              ...workspace,
              status: 'archived',
              // Don't auto-restore even if expired - let backend handle permanent deletion
            };
          }
        }
        return workspace;
      });
      
      return {
        ...state,
        workspace: {
          ...state.workspace,
          workspaces: updatedWorkspaces,
        },
      };
    }
    
    return state;
  },
};

export const createPersistConfig = (storage: any): PersistConfig<any> => ({
  key: 'root',
  storage,
  version: PERSIST_VERSION,
  migrate: (state: any) => {
    console.log('Running persist migration');
    return Promise.resolve(state);
  },
  whitelist: ['auth', 'workspace', 'boards', 'spaces'],
});
