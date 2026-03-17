import React, { createContext, useState, useContext, ReactNode } from 'react';

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

export interface Plot {
  id: string;
  name: string;
  entrances: Entrance[];
}

interface PlotsContextType {
  plots: Plot[];
  addPlot: (name: string) => void;
  updatePlot: (plotId: string, updatedPlot: Plot) => void;
}

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

  const addPlot = (name: string) => {
    const newPlot: Plot = {
      id: Date.now().toString(),
      name: name || `Участок ${plots.length + 1}`,
      entrances: generateDefaultEntrances(),
    };
    setPlots([...plots, newPlot]);
  };

  const updatePlot = (plotId: string, updatedPlot: Plot) => {
    setPlots(plots.map((plot) => (plot.id === plotId ? updatedPlot : plot)));
  };

  const generateDefaultEntrances = (): Entrance[] => {
    const entrances: Entrance[] = [];
    for (let e = 1; e <= 2; e++) {
      const floors: Floor[] = [];
      for (let f = 1; f <= 5; f++) {
        const apartments: Apartment[] = [];
        for (let a = 1; a <= 4; a++) {
          apartments.push({
            id: `e${e}f${f}a${a}`,
            number: e * 100 + f * 10 + a,
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

  return (
    <PlotsContext.Provider value={{ plots, addPlot, updatePlot }}>
      {children}
    </PlotsContext.Provider>
  );
};
