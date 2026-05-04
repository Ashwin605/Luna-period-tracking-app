import uuid from 'react-native-uuid';

import type { CycleEntry } from '../../types/cycle';
import { nowIsoTimestamp } from '../../utils/dateHelpers';
import { getDatabase } from './migrations';

interface CycleRow {
  id: string;
  start_date: string;
  end_date: string | null;
  period_length: number;
  cycle_length: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

function rowToEntry(row: CycleRow): CycleEntry {
  return {
    id: row.id,
    startDate: row.start_date,
    endDate: row.end_date,
    periodLength: row.period_length,
    cycleLength: row.cycle_length,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listCycles(): Promise<CycleEntry[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<CycleRow>(
    'SELECT * FROM cycles ORDER BY start_date ASC'
  );
  return rows.map(rowToEntry);
}

export async function getCycleById(id: string): Promise<CycleEntry | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<CycleRow>(
    'SELECT * FROM cycles WHERE id = ?',
    [id]
  );
  return row ? rowToEntry(row) : null;
}

export async function createCycle(input: {
  startDate: string;
  periodLength?: number;
  notes?: string | null;
}): Promise<CycleEntry> {
  const db = await getDatabase();
  const id = String(uuid.v4());
  const now = nowIsoTimestamp();
  const periodLength = input.periodLength ?? 5;
  const notes = input.notes ?? null;

  await db.runAsync(
    `INSERT INTO cycles
     (id, start_date, end_date, period_length, cycle_length, notes, created_at, updated_at)
     VALUES (?, ?, NULL, ?, NULL, ?, ?, ?)`,
    [id, input.startDate, periodLength, notes, now, now]
  );

  return {
    id,
    startDate: input.startDate,
    endDate: null,
    periodLength,
    cycleLength: null,
    notes,
    createdAt: now,
    updatedAt: now,
  };
}

export async function updateCycle(
  id: string,
  updates: Partial<Omit<CycleEntry, 'id' | 'createdAt'>>
): Promise<void> {
  const db = await getDatabase();
  const now = nowIsoTimestamp();

  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  if (updates.startDate !== undefined) {
    fields.push('start_date = ?');
    values.push(updates.startDate);
  }
  if (updates.endDate !== undefined) {
    fields.push('end_date = ?');
    values.push(updates.endDate);
  }
  if (updates.periodLength !== undefined) {
    fields.push('period_length = ?');
    values.push(updates.periodLength);
  }
  if (updates.cycleLength !== undefined) {
    fields.push('cycle_length = ?');
    values.push(updates.cycleLength);
  }
  if (updates.notes !== undefined) {
    fields.push('notes = ?');
    values.push(updates.notes);
  }

  fields.push('updated_at = ?');
  values.push(now);
  values.push(id);

  await db.runAsync(
    `UPDATE cycles SET ${fields.join(', ')} WHERE id = ?`,
    values
  );
}

export async function deleteCycle(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM cycles WHERE id = ?', [id]);
}

export async function deleteAllCycles(): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM cycles');
}
