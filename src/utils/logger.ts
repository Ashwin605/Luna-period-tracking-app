const SENSITIVE_KEY = /cycle|symptom|mood|flow|period|log|date/i;

function sanitize(value: unknown): unknown {
  if (value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(sanitize);
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (SENSITIVE_KEY.test(k)) {
      out[k] = '[redacted]';
    } else {
      out[k] = sanitize(v);
    }
  }
  return out;
}

export const logger = {
  debug: (...args: unknown[]) => {
    if (__DEV__) {
      console.log(...args);
    }
  },
  info: (msg: string, meta?: unknown) => {
    if (__DEV__) {
      console.info(msg, meta ?? '');
    }
  },
  warn: (msg: string, meta?: unknown) => {
    console.warn(msg, sanitize(meta) ?? '');
  },
  error: (msg: string, meta?: unknown) => {
    console.error(msg, sanitize(meta) ?? '');
  },
};
