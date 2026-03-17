import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Button,
} from 'react-native';
import { usePlots } from '@/src/context/PlotsContext';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Типы
interface Apartment {
  id: string;
  number: number;
  color: string | null;
  comment: string;
}

interface Floor {
  id: string;
  number: number;
  apartments: Apartment[];
}

interface Entrance {
  id: string;
  number: number;
  floors: Floor[];
}

interface Plot {
  id: string;
  name: string;
  entrances: Entrance[];
}

export default function PlotDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { plots, updatePlot } = usePlots();
  const plot = plots.find((p) => p.id === id);

  const [selectedApartment, setSelectedApartment] = useState<Apartment | null>(
    null,
  );
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [comment, setComment] = useState<string>('');

  if (!plot) {
    return (
      <View style={styles.container}>
        <Text>Участок не найден</Text>
      </View>
    );
  }

  const handleApartmentPress = (apartment: Apartment) => {
    setSelectedApartment(apartment);
    setSelectedColor(apartment.color);
    setComment(apartment.comment);
    setModalVisible(true);
  };

  const saveApartmentChanges = () => {
    if (!selectedApartment) return;

    const updatedPlot = { ...plot };
    for (let entrance of updatedPlot.entrances) {
      for (let floor of entrance.floors) {
        const aptIndex = floor.apartments.findIndex(
          (a) => a.id === selectedApartment.id,
        );
        if (aptIndex !== -1) {
          floor.apartments[aptIndex] = {
            ...selectedApartment,
            color: selectedColor,
            comment,
          };
          break;
        }
      }
    }
    updatePlot(id, updatedPlot);
    setModalVisible(false);
  };

  const renderEntrance = ({ item }: { item: Entrance }) => (
    <View style={styles.entranceContainer}>
      <Text style={styles.entranceTitle}>Подъезд {item.number}</Text>
      {item.floors.map((floor) => (
        <View key={floor.id} style={styles.floorContainer}>
          <Text style={styles.floorTitle}>Этаж {floor.number}</Text>
          <View style={styles.apartmentsRow}>
            {floor.apartments.map((apt) => (
              <TouchableOpacity
                key={apt.id}
                style={[
                  styles.apartmentButton,
                  apt.color === 'green' && styles.colorGreen,
                  apt.color === 'red' && styles.colorRed,
                  apt.color === 'yellow' && styles.colorYellow,
                ]}
                onPress={() => handleApartmentPress(apt)}
              >
                <Text style={styles.apartmentText}>{apt.number}</Text>
                {apt.comment ? (
                  <Ionicons
                    name='chatbubble-outline'
                    size={16}
                    color='#333'
                    style={styles.commentIcon}
                  />
                ) : null}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: plot.name,
        }}
      />

      <FlatList
        data={plot.entrances}
        keyExtractor={(item) => item.id}
        renderItem={renderEntrance}
      />

      <Modal
        animationType='slide'
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Квартира {selectedApartment?.number}
            </Text>
            <View style={styles.colorPicker}>
              <TouchableOpacity
                style={[
                  styles.colorOption,
                  styles.colorGreen,
                  selectedColor === 'green' && styles.selectedColor,
                ]}
                onPress={() => setSelectedColor('green')}
              />
              <TouchableOpacity
                style={[
                  styles.colorOption,
                  styles.colorRed,
                  selectedColor === 'red' && styles.selectedColor,
                ]}
                onPress={() => setSelectedColor('red')}
              />
              <TouchableOpacity
                style={[
                  styles.colorOption,
                  styles.colorYellow,
                  selectedColor === 'yellow' && styles.selectedColor,
                ]}
                onPress={() => setSelectedColor('yellow')}
              />
            </View>
            <TextInput
              style={styles.commentInput}
              placeholder='Комментарий'
              value={comment}
              onChangeText={setComment}
              multiline
            />
            <View style={styles.modalButtons}>
              <Button title='Отмена' onPress={() => setModalVisible(false)} />
              <Button title='Сохранить' onPress={saveApartmentChanges} />
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
  entranceContainer: {
    marginBottom: 24,
    backgroundColor: '#e9e9e9',
    padding: 12,
    borderRadius: 8,
  },
  entranceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  floorContainer: {
    marginBottom: 12,
  },
  floorTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  apartmentsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  apartmentButton: {
    width: 60,
    height: 60,
    backgroundColor: '#ddd',
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  apartmentText: {
    fontWeight: 'bold',
  },
  commentIcon: {
    position: 'absolute',
    bottom: 2,
    right: 2,
  },
  colorGreen: {
    backgroundColor: '#4CAF50',
  },
  colorRed: {
    backgroundColor: '#F44336',
  },
  colorYellow: {
    backgroundColor: '#FFC107',
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
  colorPicker: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  colorOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: '#000',
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    marginBottom: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});
