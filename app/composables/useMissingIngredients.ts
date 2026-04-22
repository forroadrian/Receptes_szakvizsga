import { ref } from "vue";

export type MissingIngredient = {
    ingredient_id: number;
    ingredient_name: string;
    required_quantity: number;
    required_unit: string;
    has_expired_stock: boolean;
};

type CountRow = {
    day: string;
    missing_count: number;
};

const counts = ref<Map<string, number>>(new Map());
const dayDetails = ref<Map<string, MissingIngredient[]>>(new Map());
const loadedMonths = ref<Set<string>>(new Set());

export function useMissingIngredients() {
    const monthKey = (year: number, month: number) =>
        `${year}-${String(month + 1).padStart(2, "0")}`;

    const loadCountsForMonth = async (year: number, month: number) => {
        const key = monthKey(year, month);
        if (loadedMonths.value.has(key)) return;

        const from = `${key}-01`;
        const lastDay = new Date(year, month + 1, 0).getDate();
        const to = `${key}-${String(lastDay).padStart(2, "0")}`;

        try {
            const rows = await $fetch<CountRow[]>("/api/menu/missing-counts", {
                method: "GET",
                query: { from, to },
            });
            for (const row of rows ?? []) {
                counts.value.set(row.day, row.missing_count);
            }
            loadedMonths.value.add(key);
        } catch (err) {
            console.error("Failed to load missing-ingredient counts", err);
        }
    };

    const invalidate = () => {
        counts.value.clear();
        dayDetails.value.clear();
        loadedMonths.value.clear();
    };

    const getCount = (dateKey: string): number => counts.value.get(dateKey) ?? 0;

    const loadDay = async (dateKey: string): Promise<MissingIngredient[]> => {
        if (dayDetails.value.has(dateKey)) {
            return dayDetails.value.get(dateKey)!;
        }
        const rows = await $fetch<MissingIngredient[]>("/api/menu/missing", {
            method: "GET",
            query: { date: dateKey },
        });
        const list = rows ?? [];
        dayDetails.value.set(dateKey, list);
        return list;
    };

    return {
        counts,
        getCount,
        loadCountsForMonth,
        loadDay,
        invalidate,
    };
}
