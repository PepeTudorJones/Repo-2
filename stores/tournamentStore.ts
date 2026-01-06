import { create } from 'zustand';
import { Tournament, Asset, TournamentStatus } from '../types';

interface TournamentState {
  tournaments: Tournament[];
  selectedTournament: Tournament | null;
  filters: {
    asset: Asset | null;
    minBuyIn: number;
    maxBuyIn: number;
    status: TournamentStatus | null;
  };
  setTournaments: (tournaments: Tournament[]) => void;
  addTournament: (tournament: Tournament) => void;
  updateTournament: (id: string, updates: Partial<Tournament>) => void;
  setSelectedTournament: (tournament: Tournament | null) => void;
  setFilters: (filters: Partial<TournamentState['filters']>) => void;
  getFilteredTournaments: () => Tournament[];
}

export const useTournamentStore = create<TournamentState>((set, get) => ({
  tournaments: [],
  selectedTournament: null,
  filters: {
    asset: null,
    minBuyIn: 0,
    maxBuyIn: 10000,
    status: null,
  },

  setTournaments: (tournaments) => set({ tournaments }),

  addTournament: (tournament) => set((state) => ({
    tournaments: [...state.tournaments, tournament],
  })),

  updateTournament: (id, updates) => set((state) => ({
    tournaments: state.tournaments.map((t) =>
      t.id === id ? { ...t, ...updates } : t
    ),
    selectedTournament:
      state.selectedTournament?.id === id
        ? { ...state.selectedTournament, ...updates }
        : state.selectedTournament,
  })),

  setSelectedTournament: (tournament) => set({ selectedTournament: tournament }),

  setFilters: (filters) => set((state) => ({
    filters: { ...state.filters, ...filters },
  })),

  getFilteredTournaments: () => {
    const { tournaments, filters } = get();
    return tournaments.filter((tournament) => {
      if (filters.asset && tournament.asset !== filters.asset) return false;
      if (tournament.buyIn < filters.minBuyIn) return false;
      if (tournament.buyIn > filters.maxBuyIn) return false;
      if (filters.status && tournament.status !== filters.status) return false;
      return true;
    });
  },
}));
