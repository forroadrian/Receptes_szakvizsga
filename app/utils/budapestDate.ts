const BUDAPEST_TZ = "Europe/Budapest";

const keyFormatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: BUDAPEST_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
});

export function toBudapestDateKey(date: Date | string): string {
    const d = typeof date === "string" ? new Date(date) : date;
    return keyFormatter.format(d);
}

export function todayBudapestKey(): string {
    return toBudapestDateKey(new Date());
}

export function daysFromToday(dateIso: string): number {
    const todayKey = todayBudapestKey();
    const today = new Date(todayKey + "T00:00:00Z");
    const target = new Date(toBudapestDateKey(dateIso) + "T00:00:00Z");
    return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

export function hoursFromNow(dateIso: string): number {
    const target = new Date(dateIso).getTime();
    return (target - Date.now()) / 3_600_000;
}

export { BUDAPEST_TZ };
