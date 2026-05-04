export const CREATE_CYCLES_TABLE = `
  CREATE TABLE IF NOT EXISTS cycles (
    id TEXT PRIMARY KEY NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT,
    period_length INTEGER NOT NULL DEFAULT 5,
    cycle_length INTEGER,
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`;

export const CREATE_DAILY_LOGS_TABLE = `
  CREATE TABLE IF NOT EXISTS daily_logs (
    id TEXT PRIMARY KEY NOT NULL,
    date TEXT NOT NULL UNIQUE,
    cycle_id TEXT,
    mood INTEGER NOT NULL DEFAULT 3,
    flow TEXT NOT NULL DEFAULT 'none',
    symptoms TEXT NOT NULL DEFAULT '[]',
    energy_level INTEGER NOT NULL DEFAULT 3,
    notes TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (cycle_id) REFERENCES cycles(id) ON DELETE SET NULL
  );
`;

export const CREATE_SETTINGS_TABLE = `
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`;

export const CREATE_INDEXES = `
  CREATE INDEX IF NOT EXISTS idx_daily_logs_date ON daily_logs(date);
  CREATE INDEX IF NOT EXISTS idx_daily_logs_cycle_id ON daily_logs(cycle_id);
  CREATE INDEX IF NOT EXISTS idx_cycles_start_date ON cycles(start_date);
`;

export const DB_NAME = 'luna.db';
