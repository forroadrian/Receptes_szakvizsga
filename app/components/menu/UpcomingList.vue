<script setup lang="ts">
import { computed } from "vue";
import { useMenuStore } from "~/stores/menu";
import { toBudapestDateKey, todayBudapestKey } from "~/utils/budapestDate";

const emit = defineEmits<{
    (e: "day-click", dateKey: string): void;
    (e: "empty-click", dateKey: string): void;
}>();

const menuStore = useMenuStore();
const { t, locale } = useI18n();

const intlLocale = computed(() => (locale.value === "hu" ? "hu-HU" : "en-US"));

type MenuEntry = {
    name: string;
    time: string;
    sortKey: number;
};

type Row = {
    dateKey: string;
    date: Date;
    dayNumber: number;
    weekdayLabel: string;
    isToday: boolean;
    menuEntries: MenuEntry[];
};

const rows = computed<Row[]>(() => {
    const today = new Date();
    const todayKey = todayBudapestKey();
    const weekdayFormatter = new Intl.DateTimeFormat(intlLocale.value, {
        timeZone: "Europe/Budapest",
        weekday: "short",
    });
    const timeFormatter = new Intl.DateTimeFormat(intlLocale.value, {
        timeZone: "Europe/Budapest",
        hour: "2-digit",
        minute: "2-digit",
    });
    const result: Row[] = [];

    for (let i = 0; i < 7; i++) {
        const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
        const dateKey = toBudapestDateKey(d);
        const menus = menuStore.getMenusForDate(dateKey);

        const menuEntries: MenuEntry[] = menus
            .map((m) => {
                const when = new Date(m.planned_date);
                return {
                    name: m.name || t("menu.untitled"),
                    time: timeFormatter.format(when),
                    sortKey: when.getTime(),
                };
            })
            .sort((a, b) => a.sortKey - b.sortKey);

        result.push({
            dateKey,
            date: d,
            dayNumber: d.getDate(),
            weekdayLabel: weekdayFormatter.format(d),
            isToday: dateKey === todayKey,
            menuEntries,
        });
    }
    return result;
});

const onRowClick = (row: Row) => {
    if (row.menuEntries.length) emit("day-click", row.dateKey);
    else emit("empty-click", row.dateKey);
};
</script>

<template>
    <section class="upcoming-card">
        <header class="d-flex align-items-center justify-content-between mb-3">
            <p class="card-title mb-0">
                <i class="bi bi-calendar-week me-2"></i>
                {{ $t('menu.upcoming.title') }}
            </p>
        </header>

        <ul class="list-unstyled m-0">
            <li
                v-for="row in rows"
                :key="row.dateKey"
                class="row-item"
                :class="{ 'is-today': row.isToday, 'is-empty': !row.menuEntries.length }"
                @click="onRowClick(row)"
            >
                <div class="date-chip">
                    <span class="weekday">{{ row.weekdayLabel.slice(0, 3) }}</span>
                    <span class="day">{{ row.dayNumber }}</span>
                </div>

                <div class="row-body">
                    <template v-if="row.menuEntries.length">
                        <span
                            v-for="(entry, i) in row.menuEntries"
                            :key="i"
                            class="menu-entry"
                        >
                            <span class="menu-time">{{ entry.time }}</span>
                            <span class="menu-name text-truncate">{{ entry.name }}</span>
                        </span>
                    </template>
                    <span v-else class="empty-label">{{ $t('menu.upcoming.empty') }} <u>{{ $t('menu.upcoming.emptyAction') }}</u></span>
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

.menu-entry {
    display: flex;
    align-items: baseline;
    gap: 0.4rem;
    min-width: 0;
}

.menu-time {
    font-variant-numeric: tabular-nums;
    font-weight: 600;
    color: var(--orange);
    font-size: 12px;
    flex-shrink: 0;
}

.menu-name {
    color: var(--bs-body-color);
    font-weight: 500;
    min-width: 0;
}

.empty-label {
    color: var(--bs-secondary-color);
    font-style: italic;
}

.row-item.is-empty:hover .empty-label {
    color: var(--orange);
}
</style>
