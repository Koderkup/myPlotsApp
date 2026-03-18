
import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useCallback,
  useEffect,
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
  getDocs,
  addDoc,
  updateDoc,
  onSnapshot,
  deleteDoc,
} from 'firebase/firestore';

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
  const [plots, setPlots] = useState<Plot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadPlots = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'plots'));
        const loadedPlots: Plot[] = [];
        querySnapshot.forEach((doc) => {
          loadedPlots.push({ id: doc.id, ...doc.data() } as Plot);
        });
        setPlots(loadedPlots);
      } catch (error) {
        console.error('Error loading plots:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPlots();

    const unsubscribe = onSnapshot(collection(db, 'plots'), (snapshot) => {
      const updatedPlots: Plot[] = [];
      snapshot.forEach((doc) => {
        updatedPlots.push({ id: doc.id, ...doc.data() } as Plot);
      });
      setPlots(updatedPlots);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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

  const updatePlot = useCallback(async (plotId: string, updatedPlot: Plot) => {
    try {
      const plotRef = doc(db, 'plots', plotId);
      await updateDoc(plotRef, { ...updatedPlot });
    } catch (error) {
      console.error('Error updating plot: ', error);
    }
  }, []);

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
    <PlotsContext.Provider value={{ plots, addPlot, updatePlot, loading, deletePlot }}>
      {children}
    </PlotsContext.Provider>
  );
};
