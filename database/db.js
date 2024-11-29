import * as SQLite from 'expo-sqlite';

export const openDatabase = () => {
  const db = SQLite.openDatabaseAsync('eLaboratuvar.db', { enableChangeListener: true });
  return db;
};
