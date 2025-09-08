import { PersistConfig } from 'redux-persist';

export const PERSIST_VERSION = 1;

export const persistMigrations = {
  // Migration from version 0 to 1
  1: (state: any) => {
    console.log('Running persist migration from version 0 to 1');
    return {
      ...state,
      // Add any migration logic here if needed
    };
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
