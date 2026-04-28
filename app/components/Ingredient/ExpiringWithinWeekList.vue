<script setup lang="ts">
import { computed } from "vue";
import { useIngredientStore } from "~/stores/ingredients";
import { toBudapestDateKey, todayBudapestKey } from "~/utils/budapestDate";

const emit = defineEmits<{
    (e: "jump", ingredientId: number): void;
}>();

const store = useIngredientStore();
const { locale } = useI18n();
const { formatIngredient } = useIngredientFormatter();

const intlLocale = computed(() => (locale.value === "hu" ? "hu-HU" : "en-US"));

type Row = {
    dateKey: string;
    dayNumber: number;
    weekdayLabel: string;
    isToday: boolean;
    items: { id: number; name: string }[];
};

const rows = computed<Row[]>(() => {
    const today = new Date();
    const todayKey = todayBudapestKey();
    const result: Row[] = [];

    const weekdayFormatter = new Intl.DateTimeFormat(intlLocale.value, {
        weekday: "short",
    });

    const byDate = new Map<string, { id: number; name: string }[]>();
    for (const ingredient of store.ingredients) {
        const key = toBudapestDateKey(ingredient.expiry.value.toISOString());
        const bucket = byDate.get(key) ?? [];
        bucket.push({ id: ingredient.id, name: ingredient.name });
        byDate.set(key, bucket);
    }

    for (let i = 0; i < 7; i++) {
        const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
        const dateKey = toBudapestDateKey(d);

        result.push({
            dateKey,
            dayNumber: d.getDate(),
            weekdayLabel: weekdayFormatter.format(d),
            isToday: dateKey === todayKey,
            items: byDate.get(dateKey) ?? [],
        });
    }
    return result;
});

const onItemClick = (id: number) => emit("jump", id);
</script>

<template>
    <section class="upcoming-card">
        <header class="d-flex align-items-center justify-content-between mb-3">
            <p class="card-title mb-0">
                <i class="bi bi-calendar-week me-2"></i>
                {{$t('pantry.upcoming.title')}}
            </p>
        </header>

        <ul class="list-unstyled m-0">
            <li
                v-for="row in rows"
                :key="row.dateKey"
                class="row-item"
                :class="{ 'is-today': row.isToday, 'is-empty': !row.items.length }"
            >
                <div class="date-chip">
                    <span class="weekday">{{ row.weekdayLabel }}</span>
                    <span class="day">{{ row.dayNumber }}</span>
                </div>

                <div class="row-body">
                    <template v-if="row.items.length">
                        <button
                            v-for="item in row.items"
                            :key="item.id"
                            type="button"
                            class="item-link text-truncate"
                            @click="onItemClick(item.id)"
                        >
                            {{ formatIngredient(item.id) }}
                        </button>
                    </template>
                    <span v-else class="empty-label">{{ $t('pantry.upcoming.empty') }}</span>
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
    transition: background-color 0.15s ease-in;
}

.row-item + .row-item {
    border-top: 1px dashed var(--bs-border-color);
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

.item-link {
    background: none;
    border: none;
    padding: 0;
    text-align: left;
    color: var(--bs-body-color);
    font-weight: 500;
    cursor: pointer;
}

.item-link:hover {
    color: var(--orange);
    text-decoration: underline;
}

.empty-label {
    color: var(--bs-secondary-color);
    font-style: italic;
}
</style>
