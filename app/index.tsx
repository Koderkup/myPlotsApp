import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { usePlots } from '../src/context/PlotsContext';
import { useAuth } from '../src/context/AuthContext';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Plot, Entrance, Floor } from '../src/types';

export default function HomeScreen() {
  const { plots, loading: plotsLoading, deletePlot } = usePlots();
  const { user, loading: authLoading, signOut } = useAuth();

  // const getInitials = (name: string): string => {
  //   if (!name) return '';
  //   const parts = name.split(' ');
  //   if (parts.length >= 2) {
  //     return (parts[0][0] + parts[1][0]).toUpperCase();
  //   }
  //   return name[0].toUpperCase();
  // };

  useEffect(() => {
    if (!authLoading && !user) {
      console.log('Перенаправление на /login');
      router.replace('/login');
    }
  }, [user, authLoading]);

  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' color='#007AFF' />
        <Text style={styles.loadingText}>Проверка авторизации...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' color='#007AFF' />
        <Text style={styles.loadingText}>Перенаправление на вход...</Text>
      </View>
    );
  }

  const getTotalApartments = (entrances: Entrance[]): number => {
    return entrances.reduce((total: number, entrance: Entrance) => {
      return (
        total +
        entrance.floors.reduce((floorTotal: number, floor: Floor) => {
          return floorTotal + floor.apartments.length;
        }, 0)
      );
    }, 0);
  };

  if (plotsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' color='#007AFF' />
        <Text style={styles.loadingText}>Загрузка участков...</Text>
      </View>
    );
  }

 const handleDeletePlot = (plotId: string, plotName: string) => {
   if (Platform.OS === 'web') {
     // Для веба используем браузерный confirm
     if (window.confirm(`Удалить участок "${plotName}"?`)) {
       deletePlot(plotId).catch((error) =>
         Alert.alert('Ошибка', `Не удалось удалить участок: ${error}`),
       );
     }
   } else {
     Alert.alert(
       'Удаление участка',
       `Вы уверены, что хотите удалить "${plotName}"?`,
       [
         { text: 'Отмена', style: 'cancel' },
         {
           text: 'Удалить',
           style: 'destructive',
           onPress: async () => {
             try {
               await deletePlot(plotId);
             } catch (error) {
               Alert.alert('Ошибка', `Не удалось удалить участок: ${error}`);
             }
           },
         },
       ],
     );
   }
 };

  const renderItem = ({ item }: { item: Plot }) => (
    <View style={styles.plotItemContainer}>
      <TouchableOpacity
        style={styles.plotItem}
        onPress={() => router.push(`/plot/${item.id}` as const)}
      >
        <View style={styles.plotInfo}>
          <Text style={styles.plotName}>{item.name}</Text>
          <Text style={styles.plotDetails}>
            Подъездов: {item.entrances.length} | Этажей:{' '}
            {item.entrances[0]?.floors.length || 0} | Квартир:{' '}
            {getTotalApartments(item.entrances)}
          </Text>
          {item.params && (
            <Text style={styles.plotParams}>
              Нумерация:{' '}
              {item.params.numberingScheme === 'sequential'
                ? 'сквозная'
                : 'по подъездам'}{' '}
              | Начальный номер: {item.params.startNumber}
            </Text>
          )}
        </View>
        <Ionicons name='chevron-forward' size={24} color='#ccc' />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeletePlot(item.id, item.name)}
      >
        <Ionicons name='trash-outline' size={24} color='#ff4444' />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons
            name='home'
            size={24}
            color='#007AFF'
            style={styles.headerIcon}
          />
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {user.email || 'Koderkup'}
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={signOut} style={styles.logoutButton}>
          <Ionicons name='log-out-outline' size={24} color='#666' />
        </TouchableOpacity>
      </View>

      <FlatList
        data={plots}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name='home-outline' size={64} color='#ccc' />
            <Text style={styles.emptyText}>Нет участков</Text>
            <Text style={styles.emptySubtext}>
              Нажмите + чтобы создать новый
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push('/create-plot')}
      >
        <Ionicons name='add' size={30} color='#fff' />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    left: 0,
    marginLeft: 16,
  },
  headerIcon: {
    marginRight: 10,
  },
  avatarContainer: {
    width: '100%',
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  logoutButton: {
    padding: 5,
    position: 'absolute',
    right: 16,
  },
  plotItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  plotItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  plotInfo: {
    flex: 1,
  },
  plotName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  plotDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  plotParams: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  deleteButton: {
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 8,
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
