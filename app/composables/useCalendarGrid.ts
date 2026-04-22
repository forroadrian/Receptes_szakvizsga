import { computed, ref, type Ref } from "vue";
import { toBudapestDateKey, todayBudapestKey } from "~/utils/budapestDate";

export type CalendarCell = {
    date: Date;
    dateKey: string;
    dayNumber: number;
    isCurrentMonth: boolean;
    isToday: boolean;
    isWeekend: boolean;
};

const HUNGARIAN_MONTHS = [
    "Január",
    "Február",
    "Március",
    "Április",
    "Május",
    "Június",
    "Július",
    "Augusztus",
    "Szeptember",
    "Október",
    "November",
    "December",
];

export const HUNGARIAN_WEEKDAYS_SHORT = ["H", "K", "Sze", "Cs", "P", "Szo", "V"];
export const HUNGARIAN_WEEKDAYS_LONG = [
    "Hétfő",
    "Kedd",
    "Szerda",
    "Csütörtök",
    "Péntek",
    "Szombat",
    "Vasárnap",
];

export function useCalendarGrid(initial?: { year: number; month: number }) {
    const today = new Date();
    const year: Ref<number> = ref(initial?.year ?? today.getFullYear());
    const month: Ref<number> = ref(initial?.month ?? today.getMonth());

    const monthLabel = computed(() => `${year.value}. ${HUNGARIAN_MONTHS[month.value]}`);

    const cells = computed<CalendarCell[]>(() => {
        const firstOfMonth = new Date(year.value, month.value, 1);
        const jsDow = firstOfMonth.getDay();
        const leadingMon = (jsDow + 6) % 7;

        const gridStart = new Date(year.value, month.value, 1 - leadingMon);
        const todayKey = todayBudapestKey();
        const result: CalendarCell[] = [];

        for (let i = 0; i < 42; i++) {
            const d = new Date(
                gridStart.getFullYear(),
                gridStart.getMonth(),
                gridStart.getDate() + i
            );
            const mondayIndex = (d.getDay() + 6) % 7;
            const dateKey = toBudapestDateKey(d);
            result.push({
                date: d,
                dateKey,
                dayNumber: d.getDate(),
                isCurrentMonth: d.getMonth() === month.value,
                isToday: dateKey === todayKey,
                isWeekend: mondayIndex >= 5,
            });
        }
        return result;
    });

    const prevMonth = () => {
        if (month.value === 0) {
            year.value -= 1;
            month.value = 11;
        } else {
            month.value -= 1;
        }
    };

    const nextMonth = () => {
        if (month.value === 11) {
            year.value += 1;
            month.value = 0;
        } else {
            month.value += 1;
        }
    };

    const goToToday = () => {
        const now = new Date();
        year.value = now.getFullYear();
        month.value = now.getMonth();
    };

    return {
        year,
        month,
        cells,
        monthLabel,
        prevMonth,
        nextMonth,
        goToToday,
    };
}
