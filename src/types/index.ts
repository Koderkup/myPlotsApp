export interface Apartment {
  id: string;
  number: number;
  color: string | null;
  comment: string;
}

export interface Floor {
  id: string;
  number: number;
  apartments: Apartment[];
}

export interface Entrance {
  id: string;
  number: number;
  floors: Floor[];
}


export interface PlotParams {
  name: string;
  entrances: number;
  floors: number;
  apartmentsPerFloor: number;
  startNumber: number;
  numberingScheme: 'sequential' | 'byEntrance';
}

export interface Plot {
  id: string;
  name: string;
  entrances: Entrance[];
  params: PlotParams; 
}


export interface PlotsContextType {
  plots: Plot[];
  addPlot: (params: PlotParams) => void;
  updatePlot: (plotId: string, updatedPlot: Plot) => void;
  deletePlot: (plotId: string) => Promise<void>;
  loading: boolean;
}
