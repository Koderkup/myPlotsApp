import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  Modal,
  Button,
} from 'react-native';
import { usePlots } from '@/src/context/PlotsContext';
import { router } from 'expo-router';


interface Plot {
  id: string;
  name: string;
  entrances: any[]; 
}

export default function HomeScreen() {
  const { plots, addPlot } = usePlots();
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [plotName, setPlotName] = useState<string>('');

  const handleAddPlot = () => {
    if (plotName.trim()) {
      addPlot(plotName);
      setPlotName('');
      setModalVisible(false);
    } else {
      Alert.alert('Ошибка', 'Введите название участка');
    }
  };

  const renderItem = ({ item }: { item: Plot }) => (
    <TouchableOpacity
      style={styles.plotItem}
      onPress={() => router.push(`/plot/${item.id}`)}
    >
      <Text style={styles.plotName}>{item.name}</Text>
      <Text>Подъездов: {item.entrances.length}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={plots}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.empty}>Нет участков. Добавьте новый.</Text>
        }
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addButtonText}>+ Добавить участок</Text>
      </TouchableOpacity>

      <Modal
        animationType='slide'
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Новый участок</Text>
            <TextInput
              style={styles.input}
              placeholder='Название участка'
              value={plotName}
              onChangeText={setPlotName}
            />
            <View style={styles.modalButtons}>
              <Button title='Отмена' onPress={() => setModalVisible(false)} />
              <Button title='Добавить' onPress={handleAddPlot} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  plotItem: {
    padding: 16,
    backgroundColor: '#f0f0f0',
    marginBottom: 8,
    borderRadius: 8,
  },
  plotName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  empty: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});
