export const fetchGuides = async (db) => {
    return await db.getAllAsync('SELECT * FROM Guides');
  };
  
  export const addGuide = async (db, name, description, unit) => {
    const result = await db.runAsync(
      'INSERT INTO Guides (name, description, unit) VALUES (?, ?, ?)',
      [name, description, unit]
    );
    return result.lastInsertRowId;
  };
  
  export const deleteGuide = async (db, id) => {
    await db.runAsync('DELETE FROM Guides WHERE id = ?', [id]);
  };
  
  export const fetchTestTypesByGuide = async (db, guideId) => {
    return await db.getAllAsync('SELECT * FROM TestTypes WHERE guide_id = ?', [guideId]);
  };
  
  export const fetchAgeGroupsByTestType = async (db, testTypeId) => {
    return await db.getAllAsync('SELECT * FROM AgeGroups WHERE test_type_id = ?', [testTypeId]);
  };
  