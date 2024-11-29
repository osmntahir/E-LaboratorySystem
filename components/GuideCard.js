import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function GuideCard({ guide, onExpand, onDelete }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{guide.name}</Text>
      <Text style={styles.description}>{guide.description}</Text>
      <Text style={styles.unit}>Birim: {guide.unit}</Text>
      <Button title="Detaylar" onPress={() => onExpand(guide.id)} />
      <Button title="Sil" color="red" onPress={() => onDelete(guide.id)} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    color: '#555',
  },
  unit: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#777',
  },
});
