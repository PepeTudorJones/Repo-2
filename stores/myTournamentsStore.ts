import { create } from 'zustand';
import { Tournament, Table, PredictionDirection } from '../types';

/**
 * Tracks the user's participation in a specific tournament
 */
export interface TournamentParticipation {
  tournament: Tournament;
  tableId: string | null; // Current table assignment
  currentTable: Table | null;
  isEliminated: boolean;
  strikes: number; // Current strike count (0-3)
  placement: number | null; // Final placement if tournament is complete
  prize: number | null; // Prize won if placed in the money
  // Prediction state
  needsPrediction: boolean; // Does current round need a prediction?
  predictionDeadline: number | null; // When does prediction lock?
  myPrediction: PredictionDirection | null;
  predictionLocked: boolean;
  // Notification tracking
  scheduledNotifications: {
    roundStartId: string | null;
    lockWarningId: string | null;
    lockDeadlineId: string | null;
  };
  // Timestamps
  joinedAt: number;
  lastActivity: number;
}

interface MyTournamentsState {
  // Map of tournamentId -> participation data
  activeTournaments: Map<string, TournamentParticipation>;

  // Actions
  joinTournament: (tournament: Tournament, tableId: string) => void;
  leaveTournament: (tournamentId: string) => void;
  updateTournamentData: (tournamentId: string, updates: Partial<TournamentParticipation>) => void;
  setMyPrediction: (tournamentId: string, prediction: PredictionDirection) => void;
  lockPrediction: (tournamentId: string) => void;
  addStrike: (tournamentId: string) => void;
  markEliminated: (tournamentId: string) => void;
  completeTournament: (tournamentId: string, placement: number, prize: number) => void;

  // Getters
  getActiveTournaments: () => TournamentParticipation[];
  getTournamentsNeedingAttention: () => TournamentParticipation[];
  getWaitingTournaments: () => TournamentParticipation[];
  getTournamentById: (tournamentId: string) => TournamentParticipation | null;
  hasActiveTournaments: () => boolean;
}

export const useMyTournamentsStore = create<MyTournamentsState>((set, get) => ({
  activeTournaments: new Map(),

  joinTournament: (tournament, tableId) => {
    const participation: TournamentParticipation = {
      tournament,
      tableId,
      currentTable: null,
      isEliminated: false,
      strikes: 0,
      placement: null,
      prize: null,
      needsPrediction: false,
      predictionDeadline: null,
      myPrediction: null,
      predictionLocked: false,
      scheduledNotifications: {
        roundStartId: null,
        lockWarningId: null,
        lockDeadlineId: null,
      },
      joinedAt: Date.now(),
      lastActivity: Date.now(),
    };

    set((state) => {
      const newMap = new Map(state.activeTournaments);
      newMap.set(tournament.id, participation);
      return { activeTournaments: newMap };
    });
  },

  leaveTournament: (tournamentId) => {
    set((state) => {
      const newMap = new Map(state.activeTournaments);
      newMap.delete(tournamentId);
      return { activeTournaments: newMap };
    });
  },

  updateTournamentData: (tournamentId, updates) => {
    set((state) => {
      const participation = state.activeTournaments.get(tournamentId);
      if (!participation) return state;

      const newMap = new Map(state.activeTournaments);
      newMap.set(tournamentId, {
        ...participation,
        ...updates,
        lastActivity: Date.now(),
      });
      return { activeTournaments: newMap };
    });
  },

  setMyPrediction: (tournamentId, prediction) => {
    set((state) => {
      const participation = state.activeTournaments.get(tournamentId);
      if (!participation) return state;

      const newMap = new Map(state.activeTournaments);
      newMap.set(tournamentId, {
        ...participation,
        myPrediction: prediction,
        lastActivity: Date.now(),
      });
      return { activeTournaments: newMap };
    });
  },

  lockPrediction: (tournamentId) => {
    set((state) => {
      const participation = state.activeTournaments.get(tournamentId);
      if (!participation) return state;

      const newMap = new Map(state.activeTournaments);
      newMap.set(tournamentId, {
        ...participation,
        predictionLocked: true,
        needsPrediction: false,
        lastActivity: Date.now(),
      });
      return { activeTournaments: newMap };
    });
  },

  addStrike: (tournamentId) => {
    set((state) => {
      const participation = state.activeTournaments.get(tournamentId);
      if (!participation) return state;

      const newStrikes = participation.strikes + 1;
      const isEliminated = newStrikes >= 3;

      const newMap = new Map(state.activeTournaments);
      newMap.set(tournamentId, {
        ...participation,
        strikes: newStrikes,
        isEliminated,
        lastActivity: Date.now(),
      });
      return { activeTournaments: newMap };
    });
  },

  markEliminated: (tournamentId) => {
    set((state) => {
      const participation = state.activeTournaments.get(tournamentId);
      if (!participation) return state;

      const newMap = new Map(state.activeTournaments);
      newMap.set(tournamentId, {
        ...participation,
        isEliminated: true,
        lastActivity: Date.now(),
      });
      return { activeTournaments: newMap };
    });
  },

  completeTournament: (tournamentId, placement, prize) => {
    set((state) => {
      const participation = state.activeTournaments.get(tournamentId);
      if (!participation) return state;

      const newMap = new Map(state.activeTournaments);
      newMap.set(tournamentId, {
        ...participation,
        placement,
        prize,
        lastActivity: Date.now(),
      });
      return { activeTournaments: newMap };
    });
  },

  // Getters
  getActiveTournaments: () => {
    return Array.from(get().activeTournaments.values());
  },

  getTournamentsNeedingAttention: () => {
    const tournaments = Array.from(get().activeTournaments.values());
    const now = Date.now();

    return tournaments.filter((t) => {
      // Eliminated or completed tournaments don't need attention
      if (t.isEliminated || t.placement !== null) return false;

      // Needs prediction and deadline is approaching (within 3 minutes)
      if (
        t.needsPrediction &&
        t.predictionDeadline &&
        t.predictionDeadline - now < 3 * 60 * 1000 &&
        t.predictionDeadline > now
      ) {
        return true;
      }

      // Has unpredicted round
      if (t.needsPrediction && !t.predictionLocked) {
        return true;
      }

      return false;
    });
  },

  getWaitingTournaments: () => {
    const tournaments = Array.from(get().activeTournaments.values());

    return tournaments.filter((t) => {
      // Not eliminated, not complete, and doesn't need immediate action
      return !t.isEliminated && t.placement === null && !t.needsPrediction;
    });
  },

  getTournamentById: (tournamentId) => {
    return get().activeTournaments.get(tournamentId) || null;
  },

  hasActiveTournaments: () => {
    return get().activeTournaments.size > 0;
  },
}));
