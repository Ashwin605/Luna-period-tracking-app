import { create } from 'zustand';

import type {
  CycleEntry,
  DailyLog,
  PredictionResult,
} from '../types/cycle';

interface CycleState {
  cycles: CycleEntry[];
  dailyLogs: DailyLog[];
  prediction: PredictionResult | null;
  todayLog: DailyLog | null;
  isLoading: boolean;

  setCycles: (cycles: CycleEntry[]) => void;
  setDailyLogs: (logs: DailyLog[]) => void;
  setPrediction: (prediction: PredictionResult) => void;
  setTodayLog: (log: DailyLog | null) => void;
  addCycle: (cycle: CycleEntry) => void;
  updateCycle: (id: string, updates: Partial<CycleEntry>) => void;
  upsertDailyLog: (log: DailyLog) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useCycleStore = create<CycleState>(set => ({
  cycles: [],
  dailyLogs: [],
  prediction: null,
  todayLog: null,
  isLoading: false,

  setCycles: cycles => set({ cycles }),
  setDailyLogs: dailyLogs => set({ dailyLogs }),
  setPrediction: prediction => set({ prediction }),
  setTodayLog: todayLog => set({ todayLog }),
  setLoading: isLoading => set({ isLoading }),

  addCycle: cycle => set(state => ({ cycles: [...state.cycles, cycle] })),

  updateCycle: (id, updates) =>
    set(state => ({
      cycles: state.cycles.map(c =>
        c.id === id
          ? { ...c, ...updates, updatedAt: new Date().toISOString() }
          : c
      ),
    })),

  upsertDailyLog: log =>
    set(state => {
      const exists = state.dailyLogs.find(l => l.date === log.date);
      if (exists) {
        return {
          dailyLogs: state.dailyLogs.map(l => (l.date === log.date ? log : l)),
          todayLog: log,
        };
      }
      return {
        dailyLogs: [...state.dailyLogs, log],
        todayLog: log,
      };
    }),

  reset: () =>
    set({
      cycles: [],
      dailyLogs: [],
      prediction: null,
      todayLog: null,
      isLoading: false,
    }),
}));
