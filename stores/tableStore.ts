import { create } from 'zustand';
import { Table, Round, Prediction } from '../types';

interface TableState {
  currentTable: Table | null;
  myPrediction: number | null;
  predictionLocked: boolean;
  setCurrentTable: (table: Table) => void;
  updateRound: (round: Round) => void;
  setMyPrediction: (prediction: number) => void;
  lockPrediction: () => void;
  resetPrediction: () => void;
  addPrediction: (prediction: Prediction) => void;
  clearTable: () => void;
}

export const useTableStore = create<TableState>((set) => ({
  currentTable: null,
  myPrediction: null,
  predictionLocked: false,

  setCurrentTable: (table) => set({ currentTable: table }),

  updateRound: (round) => set((state) =>
    state.currentTable
      ? { currentTable: { ...state.currentTable, currentRound: round } }
      : state
  ),

  setMyPrediction: (prediction) => set({ myPrediction: prediction }),

  lockPrediction: () => set({ predictionLocked: true }),

  resetPrediction: () => set({
    myPrediction: null,
    predictionLocked: false,
  }),

  addPrediction: (prediction) => set((state) => {
    if (!state.currentTable?.currentRound) return state;

    const updatedRound = {
      ...state.currentTable.currentRound,
      predictions: [...state.currentTable.currentRound.predictions, prediction],
    };

    return {
      currentTable: {
        ...state.currentTable,
        currentRound: updatedRound,
      },
    };
  }),

  clearTable: () => set({
    currentTable: null,
    myPrediction: null,
    predictionLocked: false,
  }),
}));
