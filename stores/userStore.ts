import { create } from 'zustand';
import { User } from '../types';

interface UserState {
  user: User | null;
  setUser: (user: User) => void;
  updateBalance: (balance: number) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  updateBalance: (balance) => set((state) =>
    state.user ? { user: { ...state.user, balance } } : state
  ),
  clearUser: () => set({ user: null }),
}));
