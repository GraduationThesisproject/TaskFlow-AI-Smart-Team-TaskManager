export const PERSIST_VERSION = 1;

export const persistMigrations = {
  1: (state: any) => {
    // Migration from version 0 to 1
    return {
      ...state,
      // Add any migration logic here if needed
    };
  },
  // Add future migrations here
  // 2: (state: any) => { ... },
};
