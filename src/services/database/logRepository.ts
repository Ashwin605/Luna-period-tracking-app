import uuid from 'react-native-uuid';

import type {
  DailyLog,
  EnergyScore,
  FlowLevel,
  MoodScore,
} from '../../types/cycle';
import { nowIsoTimestamp } from '../../utils/dateHelpers';
import { getDatabase } from './migrations';

interface LogRow {
  id: string;
  date: string;
  cycle_id: string | null;
  mood: number;
  flow: string;
  symptoms: string;
  energy_level: number;
  notes: string | null;
  created_at: string;
}

function rowToLog(row: LogRow): DailyLog {
  let symptoms: string[] = [];
  try {
    const parsed = JSON.parse(row.symptoms);
    symptoms = Array.isArray(parsed) ? parsed.filter(s => typeof s === 'string') : [];
  } catch {
    symptoms = [];
  }
  return {
    id: row.id,
    date: row.date,
    cycleId: row.cycle_id,
    mood: clampMood(row.mood),
    flow: row.flow as FlowLevel,
    symptoms,
    energyLevel: clampEnergy(row.energy_level),
    notes: row.notes,
    createdAt: row.created_at,
  };
}

function clampMood(n: number): MoodScore {
  const v = Math.min(5, Math.max(1, Math.round(n)));
  return v as MoodScore;
}

function clampEnergy(n: number): EnergyScore {
  const v = Math.min(5, Math.max(1, Math.round(n)));
  return v as EnergyScore;
}

export async function listLogs(): Promise<DailyLog[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<LogRow>(
    'SELECT * FROM daily_logs ORDER BY date ASC'
  );
  return rows.map(rowToLog);
}

export async function getLogByDate(date: string): Promise<DailyLog | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<LogRow>(
    'SELECT * FROM daily_logs WHERE date = ?',
    [date]
  );
  return row ? rowToLog(row) : null;
}

export interface LogUpsertInput {
  date: string;
  cycleId: string | null;
  mood: MoodScore;
  flow: FlowLevel;
  symptoms: string[];
  energyLevel: EnergyScore;
  notes: string | null;
}

export async function upsertLog(input: LogUpsertInput): Promise<DailyLog> {
  const db = await getDatabase();
  const existing = await getLogByDate(input.date);
  const now = nowIsoTimestamp();
  const symptomsJson = JSON.stringify(input.symptoms);

  if (existing) {
    await db.runAsync(
      `UPDATE daily_logs
       SET cycle_id = ?, mood = ?, flow = ?, symptoms = ?, energy_level = ?, notes = ?
       WHERE date = ?`,
      [
        input.cycleId,
        input.mood,
        input.flow,
        symptomsJson,
        input.energyLevel,
        input.notes,
        input.date,
      ]
    );
    return {
      ...existing,
      cycleId: input.cycleId,
      mood: input.mood,
      flow: input.flow,
      symptoms: input.symptoms,
      energyLevel: input.energyLevel,
      notes: input.notes,
    };
  }

  const id = String(uuid.v4());
  await db.runAsync(
    `INSERT INTO daily_logs
     (id, date, cycle_id, mood, flow, symptoms, energy_level, notes, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      input.date,
      input.cycleId,
      input.mood,
      input.flow,
      symptomsJson,
      input.energyLevel,
      input.notes,
      now,
    ]
  );

  return {
    id,
    date: input.date,
    cycleId: input.cycleId,
    mood: input.mood,
    flow: input.flow,
    symptoms: input.symptoms,
    energyLevel: input.energyLevel,
    notes: input.notes,
    createdAt: now,
  };
}

export async function deleteAllLogs(): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM daily_logs');
}
