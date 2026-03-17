import { Stack } from 'expo-router';
import { PlotsProvider } from '@/src/context/PlotsContext';

export default function RootLayout() {
  return (
    <PlotsProvider>
      <Stack>
        <Stack.Screen
          name='index'
          options={{
            title: 'Участки',
            headerStyle: {
              backgroundColor: '#f4511e',
            },
            headerTintColor: '#fff',
          }}
        />
        <Stack.Screen
          name='plot/[id]'
          options={{
            title: 'Детали участка',
            headerStyle: {
              backgroundColor: '#f4511e',
            },
            headerTintColor: '#fff',
          }}
        />
        <Stack.Screen
          name='modal'
          options={{
            presentation: 'modal',
            title: 'Модальное окно',
          }}
        />
      </Stack>
    </PlotsProvider>
  );
}
