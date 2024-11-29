import React, { useEffect, useState } from 'react';
import { View, Button, FlatList, StyleSheet, Text } from 'react-native';
import { openDatabase } from '../database/db';
import { createTables } from '../database/migrations';
import { fetchGuides, addGuide, deleteGuide } from '../database/queries';
import GuideCard from '../components/GuideCard';

export default function GuideManagement() {
  const [db, setDb] = useState(null);
  const [guides, setGuides] = useState([]);

  useEffect(() => {
    async function setupDatabase() {
      const dbInstance = await openDatabase();
      setDb(dbInstance);
      await createTables(dbInstance);
      await loadGuides();
    }
    setupDatabase();
  }, []);

  const loadGuides = async () => {
    if (!db) return;
    const data = await fetchGuides(db);
    setGuides(data);
  };

  const handleAddGuide = async () => {
    const id = await addGuide(db, `Kılavuz ${Date.now()}`, 'Yeni kılavuz açıklaması', 'mg/dL');
    console.log(`Yeni kılavuz eklendi: ID = ${id}`);
    await loadGuides();
  };

  const handleDeleteGuide = async (id) => {
    await deleteGuide(db, id);
    console.log(`Kılavuz silindi: ID = ${id}`);
    await loadGuides();
  };

  return (
    <View style={styles.container}>
      <Button title="Yeni Kılavuz Ekle" onPress={handleAddGuide} />
      <FlatList
        data={guides}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <GuideCard guide={item} onExpand={() => console.log(item)} onDelete={handleDeleteGuide} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
});
