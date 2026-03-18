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
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { usePlots } from '../../src/context/PlotsContext';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Apartment, Entrance } from '../../src/types';

export default function PlotDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { plots, updatePlot, deletePlot, loading } = usePlots();

  const plot = plots.find((p) => p.id === id);

  const [selectedApartment, setSelectedApartment] = useState<Apartment | null>(
    null,
  );
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [comment, setComment] = useState<string>('');


  const handleDeletePlot = () => {
    console.log('Нажали удалить для', plot);
    if (!plot) return;

    if (Platform.OS === 'web') {
      if (window.confirm(`Удалить участок "${plot.name}"?`)) {
        deletePlot(plot.id)
          .then(() => router.back())
          .catch((error) =>
            Alert.alert('Ошибка', `Не удалось удалить: ${error}`),
          );
      }
    } else {
      Alert.alert(
        'Удаление участка',
        `Вы уверены, что хотите удалить "${plot.name}"?`,
        [
          { text: 'Отмена', style: 'cancel' },
          {
            text: 'Удалить',
            style: 'destructive',
            onPress: async () => {
              try {
                await deletePlot(plot.id);
                router.back();
              } catch (error) {
                Alert.alert('Ошибка', `Не удалось удалить участок: ${error}`);
              }
            },
          },
        ],
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' color='#007AFF' />
        <Text style={styles.loadingText}>Загрузка данных...</Text>
      </View>
    );
  }

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
    if (!selectedApartment || !plot) return;

    const updatedPlot = JSON.parse(JSON.stringify(plot));

    let apartmentFound = false;
    for (
      let entranceIndex = 0;
      entranceIndex < updatedPlot.entrances.length;
      entranceIndex++
    ) {
      const entrance = updatedPlot.entrances[entranceIndex];
      for (
        let floorIndex = 0;
        floorIndex < entrance.floors.length;
        floorIndex++
      ) {
        const floor = entrance.floors[floorIndex];
        const aptIndex = floor.apartments.findIndex(
          (a: Apartment) => a.id === selectedApartment.id,
        );
        if (aptIndex !== -1) {
          floor.apartments[aptIndex] = {
            ...floor.apartments[aptIndex],
            color: selectedColor,
            comment,
          };
          apartmentFound = true;
          break;
        }
      }
      if (apartmentFound) break;
    }

    if (apartmentFound) {
      updatePlot(id, updatedPlot);
    }

    setModalVisible(false);
    setSelectedApartment(null);
    setSelectedColor(null);
    setComment('');
  };

  const getApartmentStyle = (color: string | null) => {
    switch (color) {
      case 'green':
        return styles.colorGreen;
      case 'red':
        return styles.colorRed;
      case 'yellow':
        return styles.colorYellow;
      default:
        return styles.colorDefault;
    }
  };

  const renderEntrance = ({ item }: { item: Entrance }) => (
    <View style={styles.entranceContainer} key={item.id}>
      <Text style={styles.entranceTitle}>Подъезд {item.number}</Text>
      {item.floors.map((floor) => (
        <View key={floor.id} style={styles.floorContainer}>
          <Text style={styles.floorTitle}>Этаж {floor.number}</Text>
          <View style={styles.apartmentsRow}>
            {floor.apartments.map((apt) => (
              <TouchableOpacity
                key={apt.id}
                style={[styles.apartmentButton, getApartmentStyle(apt.color)]}
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
          headerRight: () => (
            <TouchableOpacity
              onPress={handleDeletePlot}
              style={{ marginRight: 16 }}
            >
              <Ionicons name='trash-outline' size={24} color='#ff4444' />
            </TouchableOpacity>
          ),
        }}
      />

      <FlatList
        data={plot.entrances}
        keyExtractor={(item) => item.id}
        renderItem={renderEntrance}
        extraData={plot}
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
              <TouchableOpacity
                style={[
                  styles.colorOption,
                  styles.colorDefault,
                  selectedColor === null && styles.selectedColor,
                ]}
                onPress={() => setSelectedColor(null)}
              >
                <Text style={styles.clearColorText}>Сброс</Text>
              </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
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
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  apartmentText: {
    fontWeight: 'bold',
    color: '#333',
  },
  commentIcon: {
    position: 'absolute',
    bottom: 2,
    right: 2,
  },
  colorDefault: {
    backgroundColor: '#ddd',
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
    flexWrap: 'wrap',
  },
  colorOption: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  selectedColor: {
    borderColor: '#000',
    borderWidth: 3,
  },
  clearColorText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
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
