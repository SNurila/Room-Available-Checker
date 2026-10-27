import { useMemo, useState } from "react";
import {
  CalendarCheck,
  Clock,
  DoorClosed,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
} from "lucide-react";
import {
  MINUTES_PER_DAY,
  Interval,
  formatRange,
  hhmmToMinutes,
  minutesToHHMM,
} from "@/lib/time";
import { checkAvailability, NOW, MAX_DURATION, AvailabilityResult } from "@/lib/availability";

const ROOM = {
  name: "Engineering Lecture Hall B",
  code: "ENG-B204",
  building: "Block B · 2nd Floor",
  capacity: 120,
};

// Fictional existing bookings (minutes after midnight)
const DEFAULT_EXISTING: Interval[] = [
  { start: 600, end: 660 }, // 10:00–11:00
  { start: 720, end: 780 }, // 12:00–13:00
];

function resultBanner(result: AvailabilityResult | null) {
  if (!result) return null;

  const config = {
    available: {
      icon: CheckCircle2,
      title: "Available",
      tone: "available",
      body: "The room is free for your requested time. You may proceed to book it elsewhere.",
    },
    unavailable: {
      icon: XCircle,
      title: "Unavailable",
      tone: "unavailable",
      body: result.status === "unavailable" ? result.reason : "",
    },
    invalid: {
      icon: AlertTriangle,
      title: "Check your times",
      tone: "invalid",
      body: result.status === "invalid" ? result.reason : "",
    },
  }[result.status];

  const Icon = config.icon;
  return { Icon, ...config };
}

function App() {
  const [blocked, setBlocked] = useState(false);
  const [startInput, setStartInput] = useState("09:30");
  const [endInput, setEndInput] = useState("10:30");
  const [result, setResult] = useState<AvailabilityResult | null>(null);
  const [checked, setChecked] = useState(false);

  const existing = DEFAULT_EXISTING;

  const startMinutes = useMemo(() => hhmmToMinutes(startInput), [startInput]);
  const endMinutes = useMemo(() => hhmmToMinutes(endInput), [endInput]);

  function handleCheck() {
    setChecked(true);
    if (startMinutes === null || endMinutes === null) {
      setResult({ status: "invalid", reason: "Enter valid times in HH:MM format." });
      return;
    }
    setResult(
      checkAvailability({
        start: startMinutes,
        end: endMinutes,
        now: NOW,
        blocked,
        existing,
      })
    );
  }

  const banner = resultBanner(result);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-2xl mx-auto px-4 py-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold leading-tight">Smart Campus</h1>
            <p className="text-sm text-slate-500">Room Availability Checker · Prototype v1</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Now badge */}
        <div className="flex items-center gap-2 text-sm text-slate-600 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
          <Clock className="w-4 h-4 text-blue-600" />
          <span>
            Current time (fictional): <strong>{minutesToHHMM(NOW)}</strong> · minute {NOW} after midnight
          </span>
        </div>

        {/* Room card */}
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <DoorClosed className="w-5 h-5 text-slate-400 mt-1" />
                <div>
                  <h2 className="text-base font-semibold">{ROOM.name}</h2>
                  <p className="text-sm text-slate-500">
                    {ROOM.code} · {ROOM.building} · seats {ROOM.capacity}
                  </p>
                </div>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                  blocked
                    ? "bg-red-50 text-red-700 border border-red-200"
                    : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                }`}
              >
                {blocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                {blocked ? "Blocked" : "Open"}
              </span>
            </div>
          </div>

          {/* Existing bookings */}
          <div className="px-5 py-4 bg-slate-50/60">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
              Existing bookings
            </p>
            {existing.length === 0 ? (
              <p className="text-sm text-slate-400">No existing bookings today.</p>
            ) : (
              <ul className="space-y-1.5">
                {existing.map((b, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between text-sm bg-white border border-slate-200 rounded-lg px-3 py-2"
                  >
                    <span className="font-medium">{formatRange(b)}</span>
                    <span className="text-xs text-slate-400">
                      {b.end - b.start} min · {minutesToHHMM(b.start)}–{minutesToHHMM(b.end)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Blocked demo control */}
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Info className="w-4 h-4 text-slate-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Room blocked state (demo control)</p>
                <p className="text-xs text-slate-500">
                  A blocked room is always unavailable, regardless of times.
                </p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={blocked}
              aria-label="Toggle room blocked state"
              onClick={() => {
                setBlocked((b) => !b);
                setChecked(false);
                setResult(null);
              }}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                blocked ? "bg-red-500" : "bg-slate-300"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform mt-0.5 ${
                  blocked ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        </section>

        {/* Checker form */}
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-700">Check a time window</h3>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-xs font-medium text-slate-600">Start time (HH:MM)</span>
              <input
                type="time"
                value={startInput}
                onChange={(e) => {
                  setStartInput(e.target.value);
                  setChecked(false);
                  setResult(null);
                }}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="text-xs text-slate-400 mt-1 block">
                Must be after {minutesToHHMM(NOW)}
              </span>
            </label>

            <label className="block">
              <span className="text-xs font-medium text-slate-600">End time (HH:MM)</span>
              <input
                type="time"
                value={endInput}
                onChange={(e) => {
                  setEndInput(e.target.value);
                  setChecked(false);
                  setResult(null);
                }}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="text-xs text-slate-400 mt-1 block">
                Max {MAX_DURATION} min duration
              </span>
            </label>
          </div>

          <button
            type="button"
            onClick={handleCheck}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg px-4 py-2.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            Check Availability
          </button>

          {banner && (
            <div
              role="status"
              aria-live="polite"
              className={`flex items-start gap-3 rounded-lg px-4 py-3 text-sm border ${
                banner.tone === "available"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : banner.tone === "unavailable"
                    ? "bg-red-50 border-red-200 text-red-800"
                    : "bg-amber-50 border-amber-200 text-amber-800"
              } ${checked ? "animate-[fadeIn_0.2s_ease-out]" : ""}`}
            >
              <banner.icon className="w-5 h-5 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">{banner.title}</p>
                <p className="mt-0.5">{banner.body}</p>
              </div>
            </div>
          )}
        </section>

        {/* Rules reference */}
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">How checking works</h3>
          <ul className="space-y-2 text-xs text-slate-600">
            <li>· Times are whole minutes from 00:00 to 24:00; start must be after now.</li>
            <li>· Maximum booking duration is 120 minutes (exactly 120 is allowed).</li>
            <li>· A blocked room is always unavailable.</li>
            <li>· Overlapping an existing booking is rejected; touching endpoints are allowed.</li>
            <li>· This tool only checks — it never creates or confirms bookings.</li>
          </ul>
        </section>

        <p className="text-center text-xs text-slate-400">
          Prototype v1 · Fictional data · No bookings are created
        </p>
      </main>
    </div>
  );
}

export default App;
