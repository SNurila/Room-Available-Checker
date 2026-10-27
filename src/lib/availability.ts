import { Interval } from "./time";

export const NOW = 540; // 09:00 — deterministic fictional "current time"
export const MAX_DURATION = 120; // minutes

export type AvailabilityResult =
  | { status: "available" }
  | { status: "unavailable"; reason: string }
  | { status: "invalid"; reason: string };

export interface CheckInput {
  start: number;
  end: number;
  now: number;
  blocked: boolean;
  existing: Interval[];
}

function isInteger(value: number): boolean {
  return Number.isFinite(value) && Math.round(value) === value;
}

// Two intervals overlap if they share any minute. Touching endpoints
// (start == bEnd or end == bStart) do NOT count as overlaps.
function overlaps(a: Interval, b: Interval): boolean {
  return a.start < b.end && a.end > b.start;
}

export function checkAvailability(input: CheckInput): AvailabilityResult {
  const { start, end, now, blocked, existing } = input;

  // AC1 — integer minutes, 0 <= start < end <= 1440, start > now
  if (!isInteger(start) || !isInteger(end)) {
    return { status: "invalid", reason: "Start and end must be whole minutes." };
  }
  if (start < 0 || end > 1440) {
    return { status: "invalid", reason: "Times must be within 00:00–24:00." };
  }
  if (start >= end) {
    return { status: "invalid", reason: "End time must be after start time." };
  }
  if (start <= now) {
    return {
      status: "invalid",
      reason: `Start time must be strictly after the current time (now).`,
    };
  }

  // AC2 — duration <= 120, exactly 120 allowed
  const duration = end - start;
  if (duration > MAX_DURATION) {
    return {
      status: "invalid",
      reason: `Booking duration is ${duration} min. Maximum allowed is ${MAX_DURATION} min.`,
    };
  }

  // AC3 — blocked room is always unavailable
  if (blocked) {
    return {
      status: "unavailable",
      reason: "This room is blocked and cannot be booked.",
    };
  }

  // AC4 — reject overlaps with existing bookings (touching endpoints allowed)
  const conflict = existing.find((b) => overlaps({ start, end }, b));
  if (conflict) {
    return {
      status: "unavailable",
      reason: `Requested time overlaps an existing booking (${conflict.start}–${conflict.end} min).`,
    };
  }

  return { status: "available" };
}
