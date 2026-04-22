<script setup lang="ts">
import { computed } from "vue";
import type { CalendarCell } from "~/composables/useCalendarGrid";
import type { MenuItem } from "~/stores/menu";

const props = defineProps<{
    cell: CalendarCell;
    menus: MenuItem[];
    missingCount?: number;
}>();

const emit = defineEmits<{
    (e: "empty-click", dateKey: string): void;
    (e: "menu-click", menuId: number): void;
    (e: "overflow-click", dateKey: string): void;
}>();

const VISIBLE_LIMIT = 3;

const visibleMenus = computed(() => props.menus.slice(0, VISIBLE_LIMIT));
const overflowCount = computed(() => Math.max(0, props.menus.length - VISIBLE_LIMIT));

const onCellClick = () => {
    if (!props.menus.length) {
        emit("empty-click", props.cell.dateKey);
    }
};

const onMenuClick = (menuId: number) => emit("menu-click", menuId);
const onOverflowClick = () => emit("overflow-click", props.cell.dateKey);
</script>

<template>
    <div
        class="cell"
        :class="{
            'is-today': cell.isToday,
            'is-weekend': cell.isWeekend,
            'other-month': !cell.isCurrentMonth,
            'is-empty': !menus.length,
        }"
        @click="onCellClick"
    >
        <div class="cell-head d-flex align-items-center justify-content-between">
            <span class="day-num">{{ cell.dayNumber }}</span>
            <span
                v-if="missingCount && missingCount > 0"
                class="missing-badge"
                :title="`${missingCount} hiányzó alapanyag`"
            >
                <i class="bi bi-exclamation-triangle-fill"></i>
                {{ missingCount }}
            </span>
        </div>

        <div class="cell-body">
            <button
                v-for="menu in visibleMenus"
                :key="menu.id"
                type="button"
                class="menu-pill text-truncate"
                :title="menu.name ?? ''"
                @click.stop="onMenuClick(menu.id)"
            >
                {{ menu.name || "Névtelen menü" }}
            </button>

            <button
                v-if="overflowCount > 0"
                type="button"
                class="overflow-pill"
                @click.stop="onOverflowClick"
            >
                + további {{ overflowCount }}
            </button>

            <div v-if="!menus.length && cell.isCurrentMonth" class="empty-hint">
                <i class="bi bi-plus-lg"></i>
            </div>
        </div>
    </div>
</template>

<style scoped>
.cell {
    height: 120px;
    padding: 6px 8px;
    border: 1px solid var(--bs-border-color);
    background: var(--bs-body-bg);
    color: var(--bs-body-color);
    display: flex;
    flex-direction: column;
    gap: 4px;
    overflow: hidden;
    cursor: pointer;
    user-select: none;
    transition: background-color 0.15s ease-in, border-color 0.15s ease-in;
}

.cell.is-empty:hover {
    background: var(--accent-soft);
    border-color: var(--accent-border);
}

.cell.other-month {
    opacity: 0.45;
    background: var(--bs-tertiary-bg);
}

.cell.is-weekend:not(.other-month) {
    background: var(--bs-secondary-bg);
}

.cell.is-today {
    border-top: 3px solid transparent;
    background-image: linear-gradient(var(--accent-soft), var(--accent-soft)),
        var(--grad-orange);
    background-origin: border-box;
    background-clip: padding-box, border-box;
}

[data-bs-theme="dark"] .cell.is-today {
    background-image:
        linear-gradient(rgba(255, 114, 49, 0.18), rgba(255, 114, 49, 0.18)),
        var(--grad-orange);
}

[data-bs-theme="dark"] .cell.is-empty:hover {
    background: rgba(255, 255, 255, 0.04);
    border-color: var(--orange);
}

[data-bs-theme="dark"] .menu-pill {
    background: rgba(255, 255, 255, 0.06);
    color: var(--bs-body-color);
    border-color: var(--bs-border-color);
}

[data-bs-theme="dark"] .menu-pill:hover {
    background: var(--orange);
    color: var(--text-light);
}

@media (max-width: 576px) {
    .cell {
        height: 78px;
        padding: 4px 5px;
        gap: 2px;
    }

    .day-num {
        font-size: 11px;
    }

    .menu-pill {
        font-size: 10px;
        padding: 1px 5px;
    }

    .overflow-pill {
        font-size: 10px;
    }

    .missing-badge {
        font-size: 10px;
        padding: 0 4px;
    }
}

.day-num {
    font-size: var(--small-text);
    font-weight: 600;
    color: var(--bs-emphasis-color);
}

.cell.is-today .day-num {
    color: var(--orange);
    font-weight: 700;
}

.missing-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    font-weight: 700;
    color: #b4410a;
    background: rgba(255, 114, 49, 0.14);
    border-radius: var(--radius-sm);
    padding: 1px 6px;
}

.cell-body {
    display: flex;
    flex-direction: column;
    gap: 3px;
    overflow: hidden;
    flex: 1;
}

.menu-pill {
    background: var(--pill-primary-soft);
    color: var(--pill-text);
    border: 1px solid var(--pill-border);
    border-radius: var(--radius-sm);
    padding: 2px 8px;
    font-size: 12px;
    line-height: 1.4;
    text-align: left;
    cursor: pointer;
    transition: background-color 0.15s ease-in;
}

.menu-pill:hover {
    background: var(--pill-primary);
    color: var(--text-light);
}

.overflow-pill {
    background: none;
    border: none;
    color: var(--pill-text-muted);
    font-size: 11px;
    text-align: left;
    padding: 1px 6px;
    cursor: pointer;
}

.overflow-pill:hover {
    color: var(--bs-emphasis-color);
    text-decoration: underline;
}

.empty-hint {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--pill-text-light);
    font-size: 18px;
    opacity: 0;
    transition: opacity 0.15s ease-in;
}

.cell.is-empty:hover .empty-hint {
    opacity: 1;
}
</style>
