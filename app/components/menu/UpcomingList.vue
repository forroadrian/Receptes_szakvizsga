<script setup lang="ts">
import { computed } from "vue";
import { HUNGARIAN_WEEKDAYS_LONG } from "~/composables/useCalendarGrid";
import { useMenuStore } from "~/stores/menu";
import { toBudapestDateKey, todayBudapestKey } from "~/utils/budapestDate";

const emit = defineEmits<{
    (e: "day-click", dateKey: string): void;
    (e: "empty-click", dateKey: string): void;
}>();

const menuStore = useMenuStore();

type Row = {
    dateKey: string;
    date: Date;
    dayNumber: number;
    weekdayLabel: string;
    isToday: boolean;
    menuNames: string[];
};

const rows = computed<Row[]>(() => {
    const today = new Date();
    const todayKey = todayBudapestKey();
    const result: Row[] = [];

    for (let i = 0; i < 7; i++) {
        const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
        const dateKey = toBudapestDateKey(d);
        const weekdayIndex = (d.getDay() + 6) % 7;
        const menus = menuStore.getMenusForDate(dateKey);

        result.push({
            dateKey,
            date: d,
            dayNumber: d.getDate(),
            weekdayLabel: HUNGARIAN_WEEKDAYS_LONG[weekdayIndex] ?? "",
            isToday: dateKey === todayKey,
            menuNames: menus.map((m) => m.name || "Névtelen menü"),
        });
    }
    return result;
});

const onRowClick = (row: Row) => {
    if (row.menuNames.length) emit("day-click", row.dateKey);
    else emit("empty-click", row.dateKey);
};
</script>

<template>
    <section class="upcoming-card">
        <header class="d-flex align-items-center justify-content-between mb-3">
            <p class="card-title mb-0">
                <i class="bi bi-calendar-week me-2"></i>
                Közelgő 7 nap
            </p>
        </header>

        <ul class="list-unstyled m-0">
            <li
                v-for="row in rows"
                :key="row.dateKey"
                class="row-item"
                :class="{ 'is-today': row.isToday, 'is-empty': !row.menuNames.length }"
                @click="onRowClick(row)"
            >
                <div class="date-chip">
                    <span class="weekday">{{ row.weekdayLabel.slice(0, 3) }}</span>
                    <span class="day">{{ row.dayNumber }}</span>
                </div>

                <div class="row-body">
                    <template v-if="row.menuNames.length">
                        <span
                            v-for="(name, i) in row.menuNames"
                            :key="i"
                            class="menu-name text-truncate"
                        >
                            {{ name }}
                        </span>
                    </template>
                    <span v-else class="empty-label">Nincs terv — <u>hozzáadás</u></span>
                </div>
            </li>
        </ul>
    </section>
</template>

<style scoped>
.upcoming-card {
    border-radius: var(--radius-md);
    padding: 1rem 1.25rem;
    background: var(--bs-body-bg);
    border: 1px solid var(--bs-border-color);
    color: var(--bs-body-color);
}

.card-title {
    font-weight: 700;
    font-size: var(--medium-text);
    color: var(--bs-emphasis-color);
    display: flex;
    align-items: center;
}

.row-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.55rem 0.25rem;
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: background-color 0.15s ease-in;
}

.row-item + .row-item {
    border-top: 1px dashed var(--bs-border-color);
}

.row-item:hover {
    background: var(--accent-soft);
}

.row-item.is-today {
    background-image: linear-gradient(90deg, rgba(255, 114, 49, 0.08), transparent);
}

.date-chip {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-width: 44px;
    padding: 0.25rem 0.35rem;
    border-radius: var(--radius-sm);
    background: var(--bs-tertiary-bg);
    line-height: 1;
}

.row-item.is-today .date-chip {
    background: var(--grad-orange);
    color: var(--text-light);
}

.weekday {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--bs-secondary-color);
}

.row-item.is-today .weekday {
    color: var(--text-light);
    opacity: 0.9;
}

.day {
    font-weight: 700;
    font-size: 1.1rem;
    color: var(--bs-emphasis-color);
}

.row-item.is-today .day {
    color: var(--text-light);
}

.row-body {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
    flex: 1;
    font-size: var(--small-text);
}

.menu-name {
    color: var(--bs-body-color);
    font-weight: 500;
}

.empty-label {
    color: var(--bs-secondary-color);
    font-style: italic;
}

.row-item.is-empty:hover .empty-label {
    color: var(--orange);
}
</style>
