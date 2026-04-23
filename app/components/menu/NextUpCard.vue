<script setup lang="ts">
import { computed } from "vue";
import { useMenuStore } from "~/stores/menu";
import { daysFromToday, hoursFromNow, todayBudapestKey, toBudapestDateKey } from "~/utils/budapestDate";

const emit = defineEmits<{
    (e: "jump", dateKey: string): void;
}>();

const menuStore = useMenuStore();
const { t, locale } = useI18n();
const next = computed(() => menuStore.nextUpcoming);

const intlLocale = computed(() => (locale.value === "hu" ? "hu-HU" : "en-US"));

const relativeLabel = computed(() => {
    const menu = next.value;
    if (!menu) return "";

    const dateKey = toBudapestDateKey(menu.planned_date);
    const todayKey = todayBudapestKey();
    const dayDiff = daysFromToday(menu.planned_date);

    const timeLabel = new Intl.DateTimeFormat(intlLocale.value, {
        timeZone: "Europe/Budapest",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(menu.planned_date));

    if (dateKey === todayKey) {
        const hours = hoursFromNow(menu.planned_date);
        if (hours < 1 && hours >= 0) return t("menu.nextUp.soon");
        if (hours >= 0) {
            const rounded = Math.round(hours);
            return t("menu.nextUp.todayAt", { time: timeLabel, hours: rounded }, rounded);
        }
        return t("menu.nextUp.today");
    }
    if (dayDiff === 1) return t("menu.nextUp.tomorrow", { time: timeLabel });
    if (dayDiff > 1 && dayDiff < 7) return t("menu.nextUp.inDays", { n: dayDiff }, dayDiff);
    return new Intl.DateTimeFormat(intlLocale.value, {
        timeZone: "Europe/Budapest",
        month: "long",
        day: "numeric",
    }).format(new Date(menu.planned_date));
});

const onJump = () => {
    if (next.value) emit("jump", toBudapestDateKey(next.value.planned_date));
};
</script>

<template>
    <section class="next-up-card" :class="{ 'is-empty': !next }">
        <p class="label mb-2">
            <i class="bi bi-hourglass-split me-2"></i>
            {{ $t('menu.nextUp.label') }}
        </p>

        <template v-if="next">
            <button type="button" class="title-btn text-start w-100" @click="onJump">
                <span class="title">{{ next.name || $t('menu.nextUp.untitled') }}</span>
                <span class="relative">{{ relativeLabel }}</span>
            </button>

            <div class="meta">
                <i class="bi bi-bag-check me-1"></i>
                {{ next.recipes.length }} {{ $t('menu.nextUp.recipeCount', next.recipes.length) }}
            </div>
        </template>

        <template v-else>
            <p class="empty mb-0">{{ $t('menu.nextUp.empty') }}</p>
        </template>
    </section>
</template>

<style scoped>
.next-up-card {
    border-radius: var(--radius-md);
    padding: 1rem 1.25rem;
    background: var(--bs-body-bg);
    border: 1px solid var(--bs-border-color);
    color: var(--bs-body-color);
}

.label {
    font-size: var(--small-text);
    font-weight: 600;
    color: var(--bs-secondary-color);
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
}

.title-btn {
    background: none;
    border: none;
    padding: 0;
    color: inherit;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
}

.title {
    font-weight: 700;
    font-size: 1.1rem;
    color: var(--bs-emphasis-color);
}

.title-btn:hover .title {
    color: var(--orange);
}

.relative {
    font-size: var(--small-text);
    color: var(--orange);
    font-weight: 600;
}

.meta {
    margin-top: 0.75rem;
    font-size: var(--small-text);
    color: var(--bs-secondary-color);
}

.empty {
    font-size: var(--small-text);
    color: var(--bs-secondary-color);
}
</style>
