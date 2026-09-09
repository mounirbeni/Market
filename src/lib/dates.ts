const dateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Africa/Casablanca", year: "numeric", month: "2-digit", day: "2-digit",
});

/** Calendar dates use Morocco's time zone, including on UTC hosted servers. */
export function todayInMorocco(now = new Date()): string {
  return dateFormatter.format(now);
}

/** Empty means unknown. Invalid supplied dates are rejected, never guessed. */
export function technicalControlDate(value: unknown): string | null {
  if (value == null || value === "") return null;
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    throw new Error("BAD_CONTROL_DATE");
  if (value.startsWith("0000")) throw new Error("BAD_CONTROL_DATE");
  const date = new Date(`${value}T00:00:00Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value)
    throw new Error("BAD_CONTROL_DATE");
  return value;
}

export function controlIsValid(value: string, today = todayInMorocco()): boolean {
  try { return Boolean(value && technicalControlDate(value) && value >= today); }
  catch { return false; }
}
