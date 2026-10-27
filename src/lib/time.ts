export const MINUTES_PER_DAY = 1440;

export function minutesToHHMM(total: number): string {
  const m = ((total % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${h.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;
}

export function hhmmToMinutes(hhmm: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
  if (!match) return null;
  const h = Number(match[1]);
  const min = Number(match[2]);
  if (Number.isNaN(h) || Number.isNaN(min)) return null;
  if (h < 0 || h > 23 || min < 0 || min > 59) return null;
  return h * 60 + min;
}

export interface Interval {
  start: number;
  end: number;
}

export function formatRange(interval: Interval): string {
  return `${minutesToHHMM(interval.start)} – ${minutesToHHMM(interval.end)}`;
}
