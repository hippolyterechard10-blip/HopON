/**
 * Date helpers tuned for HopOn's "today" and "this month" views.
 * Uses the device locale and zone — barn timezones are stored on the
 * server and rendered with the appropriate Intl formatter later.
 */

export function startOfDay(d = new Date()): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function endOfDay(d = new Date()): Date {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

export function startOfMonth(d = new Date()): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}

export function todayIso() {
  return { from: startOfDay().toISOString(), to: endOfDay().toISOString() };
}

export function thisMonthIso() {
  return { from: startOfMonth().toISOString(), to: endOfDay().toISOString() };
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", hour12: false });
}

export function formatDayLabel(iso: string): string {
  const d = new Date(iso);
  const today = startOfDay();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const ds = startOfDay(d);
  if (ds.getTime() === today.getTime()) return "Today";
  if (ds.getTime() === tomorrow.getTime()) return "Tom";
  return d.toLocaleDateString(undefined, { weekday: "short" });
}
