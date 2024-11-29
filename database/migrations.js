export const createTables = async (db) => {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS Guides (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        unit TEXT NOT NULL
      );
    `);
  
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS TestTypes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guide_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        FOREIGN KEY (guide_id) REFERENCES Guides (id) ON DELETE CASCADE
      );
    `);
  
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS AgeGroups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        test_type_id INTEGER NOT NULL,
        age_range TEXT NOT NULL,
        min_value REAL NOT NULL,
        max_value REAL NOT NULL,
        FOREIGN KEY (test_type_id) REFERENCES TestTypes (id) ON DELETE CASCADE
      );
    `);
  
    console.log('Tablolar oluşturuldu ve güncellendi.');
  };
  