export function formatUKDateTime(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null;

  const date = new Date(`${dateStr}T${timeStr}`);

  const ukDate = date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const ukTime = date
    .toLocaleTimeString("en-GB", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    .replace("AM", "am")
    .replace("PM", "pm");

  return `${ukDate} · ${ukTime}`;
}


export const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};