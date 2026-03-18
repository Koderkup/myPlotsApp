import { Stack } from 'expo-router';
import { PlotsProvider } from '../src/context/PlotsContext';
import { AuthProvider } from '../src/context/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <PlotsProvider>
        <Stack>
          <Stack.Screen
            name='index'
            options={{
              title: 'Мои участки',
              headerStyle: { backgroundColor: '#007AFF' },
              headerTintColor: '#fff',
              headerTitleStyle: { fontWeight: 'bold' },
            }}
          />
          <Stack.Screen
            name='create-plot'
            options={{
              title: 'Создание участка',
              headerStyle: { backgroundColor: '#007AFF' },
              headerTintColor: '#fff',
              presentation: 'modal',
            }}
          />
          <Stack.Screen
            name='plot/[id]'
            options={{
              title: 'Детали участка',
              headerStyle: { backgroundColor: '#007AFF' },
              headerTintColor: '#fff',
            }}
          />
        </Stack>
      </PlotsProvider>
    </AuthProvider>
  );
}
