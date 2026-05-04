<script setup lang="ts">
import { computed, watch } from "vue";
import { useCalendarGrid } from "~/composables/useCalendarGrid";
import { useMenuStore } from "~/stores/menu";
import { useMissingIngredients } from "~/composables/useMissingIngredients";

const emit = defineEmits<{
    (e: "empty-click", dateKey: string): void;
    (e: "menu-click", menuId: number): void;
    (e: "overflow-click", dateKey: string): void;
}>();

const menuStore = useMenuStore();
const missing = useMissingIngredients();
const user = useSupabaseUser();
const { year, month, cells, prevMonth, nextMonth, goToToday } = useCalendarGrid();
const { locale } = useI18n();

const weekdayLabels = computed(() => {
    const formatter = new Intl.DateTimeFormat(locale.value === "hu" ? "hu-HU" : "en-US", {
        weekday: "short",
    });
    const monday = new Date(2024, 0, 1);
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        return formatter.format(d);
    });
});

const menusForCell = (dateKey: string) => menuStore.getMenusForDate(dateKey);

watch(
    [year, month, () => user.value?.id],
    () => {
        if (user.value) missing.loadCountsForMonth(year.value, month.value);
    },
    { immediate: true }
);

const goToDate = (dateKey: string) => {
    const [y, m] = dateKey.split("-").map(Number);
    if (y != null && m != null) {
        year.value = y;
        month.value = m - 1;
    }
};

defineExpose({ goToDate });
</script>

<template>
    <section class="calendar-wrapper">
        <MenuCalendarMonthPicker
            :year="year"
            :month="month"
            @prev="prevMonth"
            @next="nextMonth"
            @today="goToToday"
        />

        <div class="weekday-row">
            <div v-for="day in weekdayLabels" :key="day" class="weekday-label">
                {{ day }}
            </div>
        </div>

        <div class="grid">
            <MenuCalendarCell
                v-for="cell in cells"
                :key="cell.dateKey"
                :cell="cell"
                :menus="menusForCell(cell.dateKey)"
                :missing-count="missing.getCount(cell.dateKey)"
                @empty-click="(k) => emit('empty-click', k)"
                @menu-click="(id) => emit('menu-click', id)"
                @overflow-click="(k) => emit('overflow-click', k)"
            />
        </div>
    </section>
</template>

<style scoped>
.calendar-wrapper {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.weekday-row,
.grid {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
}

.weekday-row {
    gap: 0;
    padding: 4px 0;
    border-bottom: 1px solid var(--bs-border-color);
}

.weekday-label {
    text-align: center;
    font-size: var(--small-text);
    font-weight: 600;
    color: var(--bs-secondary-color);
    text-transform: uppercase;
    letter-spacing: 0.03em;
}

.grid {
    gap: 0;
    border-left: 1px solid var(--bs-border-color);
    border-top: 1px solid var(--bs-border-color);
}

.grid > :deep(.cell) {
    border-left: 0;
    border-top: 0;
    border-right: 1px solid var(--bs-border-color);
    border-bottom: 1px solid var(--bs-border-color);
}

@media (max-width: 576px) {
    .weekday-label {
        font-size: 10px;
    }
}
</style>
