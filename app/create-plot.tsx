import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { usePlots } from '../src/context/PlotsContext';
import { Ionicons } from '@expo/vector-icons';
import { PlotParams } from '../src/types';

export default function CreatePlotScreen() {
  const { addPlot } = usePlots();

  const [params, setParams] = useState<PlotParams>({
    name: '',
    entrances: 2,
    floors: 5,
    apartmentsPerFloor: 4,
    startNumber: 1,
    numberingScheme: 'sequential',
  });

  const updateParam = <K extends keyof PlotParams>(
    key: K,
    value: PlotParams[K],
  ) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  };

  const handleCreatePlot = () => {
    if (!params.name.trim()) {
      Alert.alert('Ошибка', 'Введите название участка');
      return;
    }

    if (params.entrances < 1 || params.entrances > 10) {
      Alert.alert('Ошибка', 'Количество подъездов должно быть от 1 до 10');
      return;
    }

    if (params.floors < 1 || params.floors > 25) {
      Alert.alert('Ошибка', 'Количество этажей должно быть от 1 до 25');
      return;
    }

    if (params.apartmentsPerFloor < 1 || params.apartmentsPerFloor > 10) {
      Alert.alert(
        'Ошибка',
        'Количество квартир на этаже должно быть от 1 до 10',
      );
      return;
    }

    if (params.startNumber < 1 || params.startNumber > 1000) {
      Alert.alert('Ошибка', 'Начальный номер должен быть от 1 до 1000');
      return;
    }

    addPlot(params);
    router.back();
  };

  const NumberInput = ({
    label,
    value,
    onChange,
    min = 1,
    max = 100,
    step = 1,
  }: {
    label: string;
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
  }) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.numberInputRow}>
        <TouchableOpacity
          style={[
            styles.numberButton,
            value <= min && styles.numberButtonDisabled,
          ]}
          onPress={() => onChange(Math.max(min, value - step))}
          disabled={value <= min}
        >
          <Ionicons
            name='remove'
            size={20}
            color={value <= min ? '#ccc' : '#007AFF'}
          />
        </TouchableOpacity>

        <TextInput
          style={styles.numberInput}
          value={String(value)}
          onChangeText={(text) => {
            const num = parseInt(text) || min;
            onChange(Math.min(max, Math.max(min, num)));
          }}
          keyboardType='numeric'
        />

        <TouchableOpacity
          style={[
            styles.numberButton,
            value >= max && styles.numberButtonDisabled,
          ]}
          onPress={() => onChange(Math.min(max, value + step))}
          disabled={value >= max}
        >
          <Ionicons
            name='add'
            size={20}
            color={value >= max ? '#ccc' : '#007AFF'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const generatePreviewNumbers = (
    params: PlotParams,
    entranceNumber: number,
  ): number[] => {
    const { floors, apartmentsPerFloor, startNumber, numberingScheme } = params;
    const preview: number[] = [];

    for (let floor = 1; floor <= Math.min(2, floors); floor++) {
      for (let apt = 1; apt <= Math.min(2, apartmentsPerFloor); apt++) {
        let number: number;

        if (numberingScheme === 'sequential') {
          const apartmentsBefore =
            (entranceNumber - 1) * floors * apartmentsPerFloor +
            (floor - 1) * apartmentsPerFloor +
            (apt - 1);
          number = startNumber + apartmentsBefore;
        } else {
          number = startNumber + (floor - 1) * apartmentsPerFloor + (apt - 1);
        }

        preview.push(number);
      }
    }

    return preview;
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Создание участка' }} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Название участка *</Text>
          <TextInput
            style={styles.textInput}
            value={params.name}
            onChangeText={(text) => updateParam('name', text)}
            placeholder='Например: ЖК Солнечный'
          />
        </View>

        <NumberInput
          label='Количество подъездов'
          value={params.entrances}
          onChange={(value) => updateParam('entrances', value)}
          min={1}
          max={10}
        />

        <NumberInput
          label='Количество этажей'
          value={params.floors}
          onChange={(value) => updateParam('floors', value)}
          min={1}
          max={25}
        />

        <NumberInput
          label='Квартир на этаже'
          value={params.apartmentsPerFloor}
          onChange={(value) => updateParam('apartmentsPerFloor', value)}
          min={1}
          max={10}
        />

        <NumberInput
          label='Начальный номер квартиры'
          value={params.startNumber}
          onChange={(value) => updateParam('startNumber', value)}
          min={1}
          max={1000}
          step={10}
        />

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Схема нумерации</Text>
          <View style={styles.switchContainer}>
            <Text
              style={[
                styles.switchLabel,
                params.numberingScheme === 'sequential' &&
                  styles.switchLabelActive,
              ]}
            >
              Сквозная
            </Text>
            <Switch
              value={params.numberingScheme === 'byEntrance'}
              onValueChange={(value) =>
                updateParam(
                  'numberingScheme',
                  value ? 'byEntrance' : 'sequential',
                )
              }
              trackColor={{ false: '#767577', true: '#007AFF' }}
            />
            <Text
              style={[
                styles.switchLabel,
                params.numberingScheme === 'byEntrance' &&
                  styles.switchLabelActive,
              ]}
            >
              По подъездам
            </Text>
          </View>
          <Text style={styles.hint}>
            {params.numberingScheme === 'sequential'
              ? 'Квартиры нумеруются подряд: 1, 2, 3... по всем подъездам'
              : 'Нумерация начинается заново в каждом подъезде: 1, 2, 3...'}
          </Text>
        </View>

        <View style={styles.previewContainer}>
          <Text style={styles.previewTitle}>Пример нумерации:</Text>
          <Text style={styles.previewText}>
            1 подъезд: {generatePreviewNumbers(params, 1).join(', ')}...
          </Text>
          <Text style={styles.previewText}>
            2 подъезд: {generatePreviewNumbers(params, 2).join(', ')}...
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelButtonText}>Отмена</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.createButton]}
            onPress={handleCreatePlot}
          >
            <Text style={styles.createButtonText}>Создать участок</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  numberInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  numberButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  numberButtonDisabled: {
    opacity: 0.5,
  },
  numberInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 10,
    backgroundColor: '#f9f9f9',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  switchLabel: {
    fontSize: 16,
    marginHorizontal: 10,
    color: '#666',
  },
  switchLabelActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
  hint: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 4,
  },
  previewContainer: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 8,
    marginVertical: 20,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  previewText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 30,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  createButton: {
    backgroundColor: '#007AFF',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
