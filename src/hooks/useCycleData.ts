import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import {
  createCycle,
  listCycles,
  updateCycle as updateCycleRow,
} from '../services/database/cycleRepository';
import {
  getLogByDate,
  listLogs,
  upsertLog,
  type LogUpsertInput,
} from '../services/database/logRepository';
import { useCycleStore } from '../store/cycleStore';
import type { CycleEntry, DailyLog } from '../types/cycle';
import { todayIso } from '../utils/dateHelpers';

export const CYCLES_QUERY_KEY = ['cycles'] as const;
export const LOGS_QUERY_KEY = ['daily-logs'] as const;
export const TODAY_LOG_KEY = ['daily-log', 'today'] as const;

export async function refreshCyclesIntoStore(): Promise<CycleEntry[]> {
  const rows = await listCycles();
  useCycleStore.getState().setCycles(rows);
  return rows;
}

export async function refreshLogsIntoStore(): Promise<DailyLog[]> {
  const rows = await listLogs();
  useCycleStore.getState().setDailyLogs(rows);
  return rows;
}

export function useCyclesQuery() {
  const setCycles = useCycleStore(s => s.setCycles);
  const query = useQuery({
    queryKey: CYCLES_QUERY_KEY,
    queryFn: listCycles,
    staleTime: 1000 * 60,
  });

  useEffect(() => {
    if (query.data) setCycles(query.data);
  }, [query.data, setCycles]);

  return query;
}

export function useLogsQuery() {
  const setDailyLogs = useCycleStore(s => s.setDailyLogs);
  const query = useQuery({
    queryKey: LOGS_QUERY_KEY,
    queryFn: listLogs,
    staleTime: 1000 * 60,
  });

  useEffect(() => {
    if (query.data) setDailyLogs(query.data);
  }, [query.data, setDailyLogs]);

  return query;
}

export function useTodayLogQuery() {
  const setTodayLog = useCycleStore(s => s.setTodayLog);
  const query = useQuery({
    queryKey: TODAY_LOG_KEY,
    queryFn: () => getLogByDate(todayIso()),
    staleTime: 1000 * 60,
  });

  useEffect(() => {
    setTodayLog(query.data ?? null);
  }, [query.data, setTodayLog]);

  return query;
}

export function useCreateCycleMutation() {
  const queryClient = useQueryClient();
  const addCycle = useCycleStore(s => s.addCycle);
  return useMutation({
    mutationFn: (input: {
      startDate: string;
      periodLength?: number;
      notes?: string | null;
    }) => createCycle(input),
    onSuccess: (cycle: CycleEntry) => {
      addCycle(cycle);
      queryClient.invalidateQueries({ queryKey: CYCLES_QUERY_KEY });
    },
  });
}

export function useUpdateCycleMutation() {
  const queryClient = useQueryClient();
  const updateCycleStore = useCycleStore(s => s.updateCycle);
  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Omit<CycleEntry, 'id' | 'createdAt'>>;
    }) => updateCycleRow(id, updates).then(() => ({ id, updates })),
    onSuccess: ({ id, updates }) => {
      updateCycleStore(id, updates);
      queryClient.invalidateQueries({ queryKey: CYCLES_QUERY_KEY });
    },
  });
}

export function useUpsertLogMutation() {
  const queryClient = useQueryClient();
  const upsertDailyLog = useCycleStore(s => s.upsertDailyLog);
  return useMutation({
    mutationFn: (input: LogUpsertInput) => upsertLog(input),
    onSuccess: (log: DailyLog) => {
      upsertDailyLog(log);
      queryClient.invalidateQueries({ queryKey: LOGS_QUERY_KEY });
      if (log.date === todayIso()) {
        queryClient.invalidateQueries({ queryKey: TODAY_LOG_KEY });
      }
    },
  });
}
