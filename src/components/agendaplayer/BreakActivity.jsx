import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Coffee, Sandwich } from "lucide-react";
import PresenterPortal from "../quiz/shared/PresenterPortal";

export const isBreakItem = (item) => item?.type === "break" || item?.type === "lunch";

const BREAK_THEMES = {
  break: { label: "Break", Icon: Coffee, gradient: "from-sky-600 via-cyan-600 to-teal-600", emoji: "☕" },
  lunch: { label: "Lunch", Icon: Sandwich, gradient: "from-amber-500 via-orange-500 to-rose-500", emoji: "🥪" },
};

const timeToSeconds = (value) => {
  const [hours, minutes] = String(value || "").split(":").map(Number);
  return Number.isFinite(hours) ? hours * 3600 + (minutes || 0) * 60 : null;
};
const secondsOfDay = (date = new Date()) => date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds();
const clock = (totalSeconds) => {
  const safe = Math.max(0, Math.round(totalSeconds));
  return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;
};
const wallClock = (totalSeconds) => {
  const wrapped = ((Math.round(totalSeconds) % 86400) + 86400) % 86400;
  return `${String(Math.floor(wrapped / 3600)).padStart(2, "0")}:${String(Math.floor((wrapped % 3600) / 60)).padStart(2, "0")}`;
};

function BreakScreen({ item, timeLeft }) {
  const theme = BREAK_THEMES[item.type] || BREAK_THEMES.break;
  const { Icon } = theme;

  return (
    <section className={`relative flex h-full w-full flex-col items-center justify-center gap-[2.5cqh] overflow-hidden rounded-lg bg-gradient-to-br ${theme.gradient} p-[3cqh] text-center text-white`}>
      <div className="text-[clamp(1rem,3.2cqh,2rem)] font-semibold uppercase tracking-[0.35em] text-white/80">{item.label && item.label.toLowerCase() !== theme.label.toLowerCase() ? item.label : "Time for a"}</div>
      <h1 className="font-black leading-none drop-shadow-lg text-[clamp(2.5rem,15cqh,9rem)]">{theme.label}</h1>
      <div className="flex h-[30cqh] w-[30cqh] items-center justify-center overflow-hidden rounded-full border-[0.6cqh] border-white/60 bg-white/15 shadow-2xl">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={theme.label} className="h-full w-full object-cover" />
        ) : (
          <Icon className="h-[16cqh] w-[16cqh]" strokeWidth={1.5} aria-label={theme.label} />
        )}
      </div>
      <div className="font-bold tabular-nums text-[clamp(1.5rem,7cqh,4rem)]">
        {item.startTime} <span className="text-white/70">→</span> {item.endTime}
      </div>
      <div className="rounded-full bg-black/25 px-[3cqh] py-[1cqh] font-semibold tabular-nums text-[clamp(1rem,3.6cqh,2.25rem)]">
        {timeLeft > 0 ? `${clock(timeLeft)} remaining` : "Time's up — back to it!"}
      </div>
      {item.description && <p className="max-w-[80%] text-[clamp(0.9rem,2.8cqh,1.75rem)] text-white/85">{item.description}</p>}
    </section>
  );
}

function BreakController({ item, timeLeft, plannedEndSeconds, onSetMinutes, onPrevious, onNext }) {
  const [now, setNow] = useState(() => secondsOfDay());
  const [customMinutes, setCustomMinutes] = useState(String(item.minutes));

  useEffect(() => {
    const timer = window.setInterval(() => setNow(secondsOfDay()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => setCustomMinutes(String(item.minutes)), [item.minutes]);

  const resumeAt = now + timeLeft;
  const diffSeconds = plannedEndSeconds == null ? 0 : resumeAt - plannedEndSeconds;
  const diffMinutes = Math.round(diffSeconds / 60);
  const status = diffMinutes === 0
    ? { text: "On schedule", tone: "border-emerald-300 bg-emerald-50 text-emerald-900" }
    : diffMinutes > 0
      ? { text: `Running ${diffMinutes} min over schedule`, tone: "border-red-300 bg-red-50 text-red-900" }
      : { text: `${-diffMinutes} min ahead of schedule`, tone: "border-sky-300 bg-sky-50 text-sky-900" };

  const adjustButton = "rounded border border-slate-300 bg-white px-4 py-3 text-lg font-bold shadow-sm hover:bg-slate-50";
  const applyCustom = () => {
    const minutes = Number(customMinutes);
    if (Number.isFinite(minutes) && minutes >= 1) onSetMinutes(minutes);
  };

  return (
    <div className="flex h-dvh flex-col bg-slate-50 text-slate-900">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-300 bg-white p-3">
        <span className="text-lg font-bold">{item.label || BREAK_THEMES[item.type]?.label}</span>
        <div className="flex gap-2">
          <button type="button" onClick={onPrevious} className="rounded border border-slate-300 bg-white px-4 py-2 font-semibold hover:bg-slate-50">Previous</button>
          <button type="button" onClick={onNext} className="rounded bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700">Next agenda section</button>
        </div>
      </div>
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
          <div className="rounded-lg bg-white p-3 shadow-sm"><div className="text-xs font-bold uppercase text-slate-400">Scheduled</div><div className="text-xl font-bold tabular-nums">{item.startTime}–{item.endTime}</div></div>
          <div className="rounded-lg bg-white p-3 shadow-sm"><div className="text-xs font-bold uppercase text-slate-400">Time now</div><div className="text-xl font-bold tabular-nums">{wallClock(now)}</div></div>
          <div className="rounded-lg bg-white p-3 shadow-sm"><div className="text-xs font-bold uppercase text-slate-400">Remaining</div><div className="text-xl font-bold tabular-nums">{clock(timeLeft)}</div></div>
          <div className="rounded-lg bg-white p-3 shadow-sm"><div className="text-xs font-bold uppercase text-slate-400">Resumes at</div><div className="text-xl font-bold tabular-nums">{wallClock(resumeAt)}</div></div>
        </div>

        <div className={`rounded-lg border p-4 text-center text-lg font-bold ${status.tone}`}>{status.text}</div>

        <section className="space-y-2 rounded-lg bg-white p-4 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-600">Get back on schedule</h2>
          {diffMinutes === 0 ? (
            <p className="text-sm text-slate-500">The session will end exactly when planned.</p>
          ) : (
            <button
              type="button"
              onClick={() => onSetMinutes(item.minutes - diffMinutes)}
              disabled={item.minutes - diffMinutes < 1}
              className={`w-full rounded px-4 py-3 text-lg font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-300 ${diffMinutes > 0 ? "bg-rose-600 hover:bg-rose-700" : "bg-sky-600 hover:bg-sky-700"}`}
            >
              {diffMinutes > 0 ? `Reduce by ${diffMinutes} min` : `Extend by ${-diffMinutes} min`} → resume at {wallClock(plannedEndSeconds)}
            </button>
          )}
        </section>

        <section className="space-y-3 rounded-lg bg-white p-4 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-600">Adjust manually</h2>
          <div className="grid grid-cols-4 gap-2">
            {[-5, -1, 1, 5].map((delta) => (
              <button key={delta} type="button" disabled={item.minutes + delta < 1} onClick={() => onSetMinutes(item.minutes + delta)} className={`${adjustButton} disabled:cursor-not-allowed disabled:opacity-40`}>
                {delta > 0 ? `+${delta}` : delta} min
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-slate-600" htmlFor="break-total-minutes">Total length (min)</label>
            <input
              id="break-total-minutes"
              type="number"
              min="1"
              value={customMinutes}
              onChange={(event) => setCustomMinutes(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && applyCustom()}
              className="w-24 rounded border border-slate-300 px-3 py-2"
            />
            <button type="button" onClick={applyCustom} className="rounded bg-slate-800 px-4 py-2 font-semibold text-white hover:bg-slate-900">Set</button>
          </div>
          <p className="text-xs text-slate-500">Changing the length moves the start and end times of every later agenda item.</p>
        </section>
      </div>
    </div>
  );
}

const BreakActivity = forwardRef(function BreakActivity({ item, timeLeft, onSetMinutes, onNavigationChange, speakerWindow, onSpeakerWindowClose, onLeave }, ref) {
  // The planned end as it was when this section began, so adjustments are measured against the original schedule.
  const plannedEndRef = useRef(timeToSeconds(item.endTime));

  useImperativeHandle(ref, () => ({ advance: () => true, previous: () => true }), []);
  useEffect(() => {
    onNavigationChange?.({ nextLabel: "Next agenda section", step: "break" });
  }, [onNavigationChange]);

  const leave = (direction) => {
    if (onLeave) onLeave(direction);
    else window.postMessage({ action: direction === "next" ? "NEXT_SLIDE" : "PREV_SLIDE" }, "*");
  };

  return (
    <>
      <BreakScreen item={item} timeLeft={timeLeft} />
      {speakerWindow && (
        <PresenterPortal presenterWindow={speakerWindow} running closeOnUnmount={false} onClose={onSpeakerWindowClose}>
          <BreakController
            item={item}
            timeLeft={timeLeft}
            plannedEndSeconds={plannedEndRef.current}
            onSetMinutes={onSetMinutes}
            onPrevious={() => leave("prev")}
            onNext={() => leave("next")}
          />
        </PresenterPortal>
      )}
    </>
  );
});

export default BreakActivity;
