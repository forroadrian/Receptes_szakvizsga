<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { HUNGARIAN_WEEKDAYS_LONG } from "~/composables/useCalendarGrid";
import { useMenuStore, type MenuItem } from "~/stores/menu";
import { toBudapestDateKey } from "~/utils/budapestDate";

const emit = defineEmits<{
    (e: "jump", dateKey: string): void;
}>();

const menuStore = useMenuStore();

const modalElRef = ref<HTMLElement | null>(null);
let modalInstance: any = null;

const year = ref<number>(new Date().getFullYear());
const month = ref<number>(new Date().getMonth());

const HUNGARIAN_MONTHS = [
    "Január", "Február", "Március", "Április",
    "Május", "Június", "Július", "Augusztus",
    "Szeptember", "Október", "November", "December",
];

const monthLabel = computed(() => `${year.value}. ${HUNGARIAN_MONTHS[month.value]}`);

type WeekGroup = {
    weekKey: string;
    weekRange: string;
    menus: (MenuItem & { dateKey: string; weekday: string })[];
};

function isoWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
}

const weekGroups = computed<WeekGroup[]>(() => {
    const menus = menuStore
        .getMenusInMonth(year.value, month.value)
        .slice()
        .sort(
            (a, b) =>
                new Date(a.planned_date).getTime() - new Date(b.planned_date).getTime()
        );

    const groupsMap = new Map<string, WeekGroup>();

    for (const menu of menus) {
        const date = new Date(menu.planned_date);
        const week = isoWeekNumber(date);
        const weekKey = `${date.getFullYear()}-W${week}`;
        const weekdayIndex = (date.getDay() + 6) % 7;

        const decorated = {
            ...menu,
            dateKey: toBudapestDateKey(menu.planned_date),
            weekday: HUNGARIAN_WEEKDAYS_LONG[weekdayIndex] ?? "",
        };

        if (!groupsMap.has(weekKey)) {
            groupsMap.set(weekKey, {
                weekKey,
                weekRange: `${week}. hét`,
                menus: [],
            });
        }
        groupsMap.get(weekKey)!.menus.push(decorated);
    }

    return Array.from(groupsMap.values());
});

const totalCount = computed(() =>
    weekGroups.value.reduce((sum, g) => sum + g.menus.length, 0)
);

const formatDate = (dateIso: string) =>
    new Intl.DateTimeFormat("hu-HU", {
        timeZone: "Europe/Budapest",
        month: "long",
        day: "numeric",
    }).format(new Date(dateIso));

const formatTime = (dateIso: string) =>
    new Intl.DateTimeFormat("hu-HU", {
        timeZone: "Europe/Budapest",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(dateIso));

const onJump = (dateKey: string) => {
    emit("jump", dateKey);
    modalInstance?.hide();
};

const onDelete = async (menuId: number) => {
    if (!confirm("Biztosan törlöd ezt a menüt?")) return;
    try {
        await menuStore.deleteMenu(menuId);
    } catch (err) {
        alert("Nem sikerült törölni a menüt.");
    }
};

const ensureModalInstance = () => {
    if (modalInstance) return modalInstance;
    if (!modalElRef.value) return null;
    const bs = (window as any).bootstrap;
    if (!bs?.Modal) return null;
    modalInstance = bs.Modal.getOrCreateInstance(modalElRef.value);
    return modalInstance;
};

const open = (targetYear: number, targetMonth: number) => {
    year.value = targetYear;
    month.value = targetMonth;
    ensureModalInstance()?.show();
};

onMounted(() => {
    ensureModalInstance();
});

defineExpose({ open });
</script>

<template>
    <div
        id="monthMenusModal"
        ref="modalElRef"
            class="modal fade"
            tabindex="-1"
            aria-labelledby="monthMenusModalLabel"
            aria-hidden="true"
        >
            <div class="modal-dialog modal-dialog-centered modal-lg month-dialog">
                <div class="modal-content month-modal">
                    <div class="modal-header">
                        <div class="d-flex flex-column">
                            <h2 id="monthMenusModalLabel" class="modal-title fs-4 mb-1">
                                Havi menük
                            </h2>
                            <p class="mb-0 text-muted small">
                                {{ monthLabel }} — {{ totalCount }} menü
                            </p>
                        </div>
                        <button
                            type="button"
                            class="btn-close ms-3"
                            data-bs-dismiss="modal"
                            aria-label="Close"
                        ></button>
                    </div>

                    <div class="modal-body">
                        <div v-if="!weekGroups.length" class="empty">
                            <i class="bi bi-calendar-x fs-2 mb-2 d-block"></i>
                            <p class="mb-0">Nincs menü ebben a hónapban.</p>
                        </div>

                        <div v-else class="weeks">
                            <section
                                v-for="group in weekGroups"
                                :key="group.weekKey"
                                class="week-group"
                            >
                                <header class="week-header">
                                    <span class="week-name">{{ group.weekRange }}</span>
                                    <span class="week-count">
                                        {{ group.menus.length }} menü
                                    </span>
                                </header>

                                <ul class="list-unstyled m-0">
                                    <li
                                        v-for="menu in group.menus"
                                        :key="menu.id"
                                        class="menu-row"
                                    >
                                        <button
                                            type="button"
                                            class="menu-row-main"
                                            @click="onJump(menu.dateKey)"
                                        >
                                            <div class="date-chip">
                                                <span class="weekday">
                                                    {{ menu.weekday.slice(0, 3) }}
                                                </span>
                                                <span class="day">
                                                    {{ formatDate(menu.planned_date) }}
                                                </span>
                                            </div>

                                            <div class="menu-meta">
                                                <span class="menu-name">
                                                    {{ menu.name || "Névtelen menü" }}
                                                </span>
                                                <span class="menu-sub">
                                                    <i class="bi bi-clock me-1"></i>
                                                    {{ formatTime(menu.planned_date) }}
                                                    <span class="dot">·</span>
                                                    <i class="bi bi-bag-check me-1"></i>
                                                    {{ menu.recipes.length }} recept
                                                </span>
                                            </div>
                                        </button>

                                        <div class="menu-actions">
                                            <button
                                                type="button"
                                                class="icon-btn"
                                                aria-label="Megnyitás"
                                                title="Ugrás a naptárban"
                                                @click="onJump(menu.dateKey)"
                                            >
                                                <i class="bi bi-box-arrow-up-right"></i>
                                            </button>
                                            <button
                                                type="button"
                                                class="icon-btn danger"
                                                aria-label="Törlés"
                                                title="Menü törlése"
                                                @click="onDelete(menu.id)"
                                            >
                                                <i class="bi bi-trash"></i>
                                            </button>
                                        </div>
                                    </li>
                                </ul>
                            </section>
                        </div>
                    </div>

                    <div class="modal-footer">
                        <button
                            type="button"
                            class="btn btn-outline-secondary"
                            data-bs-dismiss="modal"
                        >
                            Bezárás
                        </button>
                    </div>
                </div>
            </div>
        </div>
</template>

<style scoped>
.modal-content {
    background: var(--bs-body-bg);
    color: var(--bs-body-color);
    border-radius: var(--radius-md);
}

.empty {
    text-align: center;
    padding: 3rem 1rem;
    color: var(--bs-secondary-color);
}

.weeks {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
}

.week-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    padding-bottom: 0.5rem;
    margin-bottom: 0.5rem;
    border-bottom: 1px solid var(--bs-border-color);
}

.week-name {
    font-family: "Caveat Brush", cursive;
    font-size: 1.3rem;
    color: var(--orange);
    text-transform: uppercase;
    letter-spacing: 0.03em;
}

.week-count {
    font-size: var(--small-text);
    color: var(--bs-secondary-color);
}

.menu-row {
    display: flex;
    align-items: stretch;
    gap: 0.5rem;
    padding: 0.35rem 0;
}

.menu-row + .menu-row {
    border-top: 1px dashed var(--bs-border-color);
}

.menu-row-main {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 0.5rem;
    background: none;
    border: none;
    border-radius: var(--radius-sm);
    text-align: left;
    cursor: pointer;
    color: inherit;
    transition: background 0.15s ease-in;
}

.menu-row-main:hover {
    background: var(--accent-soft);
}

[data-bs-theme="dark"] .menu-row-main:hover {
    background: rgba(255, 114, 49, 0.1);
}

.date-chip {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-width: 78px;
    padding: 0.35rem 0.5rem;
    border-radius: var(--radius-sm);
    background: var(--bs-tertiary-bg);
    line-height: 1.1;
}

.weekday {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--bs-secondary-color);
}

.day {
    font-weight: 600;
    font-size: var(--small-text);
    color: var(--bs-emphasis-color);
    text-align: center;
}

.menu-meta {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
    flex: 1;
}

.menu-name {
    font-weight: 600;
    color: var(--bs-emphasis-color);
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
}

.menu-sub {
    font-size: var(--small-text);
    color: var(--bs-secondary-color);
    display: inline-flex;
    align-items: center;
    flex-wrap: wrap;
}

.dot {
    margin: 0 0.4rem;
}

.menu-actions {
    display: flex;
    align-items: center;
    gap: 0.25rem;
}

.icon-btn {
    background: none;
    border: 1px solid var(--bs-border-color);
    color: var(--bs-secondary-color);
    width: 34px;
    height: 34px;
    border-radius: var(--radius-sm);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.15s ease-in;
}

.icon-btn:hover {
    color: var(--bs-emphasis-color);
    border-color: var(--bs-emphasis-color);
}

.icon-btn.danger:hover {
    color: #d64545;
    border-color: #d64545;
}

@media (max-width: 576px) {
    .date-chip {
        min-width: 60px;
        padding: 0.3rem 0.35rem;
    }

    .menu-row-main {
        gap: 0.5rem;
        padding: 0.4rem 0.25rem;
    }

    .icon-btn {
        width: 30px;
        height: 30px;
    }

    .menu-sub .dot + i {
        display: none;
    }
}
</style>
