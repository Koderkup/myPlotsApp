import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
  useCallback,
} from 'react';

import {
  Plot,
  PlotParams,
  PlotsContextType,
  Entrance,
  Floor,
  Apartment,
} from '../types';

import { db } from '../services/firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  onSnapshot,
  deleteDoc,
} from 'firebase/firestore';

import { useAuth } from './AuthContext';

const PlotsContext = createContext<PlotsContextType | undefined>(undefined);

export const usePlots = () => {
  const context = useContext(PlotsContext);
  if (!context) {
    throw new Error('usePlots must be used within a PlotsProvider');
  }
  return context;
};

interface PlotsProviderProps {
  children: ReactNode;
}

export const PlotsProvider = ({ children }: PlotsProviderProps) => {
  const { user, loading: authLoading } = useAuth();

  const [plots, setPlots] = useState<Plot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // -----------------------------
  // 🔥 Главный фикс: слушатель запускается ТОЛЬКО после загрузки user
  // -----------------------------
  useEffect(() => {
    if (authLoading) return; // ждём пока загрузится Auth
    if (!user) {
      setPlots([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const ref = collection(db, 'plots');

    const unsubscribe = onSnapshot(ref, (snapshot) => {
      const updated: Plot[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Plot[];

      setPlots(updated);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, authLoading]);

  // -----------------------------
  // Генерация подъездов/этажей
  // -----------------------------
  const generateEntrancesWithParams = (params: PlotParams): Entrance[] => {
    const {
      entrances: entranceCount,
      floors: floorCount,
      apartmentsPerFloor,
      startNumber,
      numberingScheme,
    } = params;

    const entrances: Entrance[] = [];

    for (let e = 1; e <= entranceCount; e++) {
      const floors: Floor[] = [];

      for (let f = 1; f <= floorCount; f++) {
        const apartments: Apartment[] = [];

        for (let a = 1; a <= apartmentsPerFloor; a++) {
          let number: number;

          if (numberingScheme === 'sequential') {
            const apartmentsBefore =
              (e - 1) * floorCount * apartmentsPerFloor +
              (f - 1) * apartmentsPerFloor +
              (a - 1);
            number = startNumber + apartmentsBefore;
          } else {
            number = startNumber + (f - 1) * apartmentsPerFloor + (a - 1);
          }

          apartments.push({
            id: `e${e}f${f}a${a}`,
            number,
            color: null,
            comment: '',
          });
        }

        floors.push({
          id: `e${e}f${f}`,
          number: f,
          apartments,
        });
      }

      entrances.push({
        id: `e${e}`,
        number: e,
        floors,
      });
    }

    return entrances;
  };

  // -----------------------------
  // Добавление участка
  // -----------------------------
  const addPlot = useCallback(async (params: PlotParams) => {
    try {
      const newPlot: Omit<Plot, 'id'> = {
        name: params.name,
        entrances: generateEntrancesWithParams(params),
        params,
      };

      await addDoc(collection(db, 'plots'), newPlot);
    } catch (error) {
      console.error('Error adding plot: ', error);
    }
  }, []);

  // -----------------------------
  // Обновление участка
  // -----------------------------
  const updatePlot = useCallback(async (plotId: string, updatedPlot: Plot) => {
    try {
      const plotRef = doc(db, 'plots', plotId);
      await updateDoc(plotRef, { ...updatedPlot });
    } catch (error) {
      console.error('Error updating plot: ', error);
    }
  }, []);

  // -----------------------------
  // Удаление участка
  // -----------------------------
  const deletePlot = useCallback(async (plotId: string) => {
    try {
      const plotRef = doc(db, 'plots', plotId);
      await deleteDoc(plotRef);
    } catch (error) {
      console.error('Error deleting plot: ', error);
      throw error;
    }
  }, []);

  return (
    <PlotsContext.Provider
      value={{ plots, addPlot, updatePlot, loading, deletePlot }}
    >
      {children}
    </PlotsContext.Provider>
  );
};
