<script setup lang="ts">
import { computed } from "vue";
import { useMenuStore } from "~/stores/menu";
import { todayBudapestKey } from "~/utils/budapestDate";

const menuStore = useMenuStore();
const { locale } = useI18n();

const now = new Date();
const dayNumber = now.getDate();

const intlLocale = computed(() => (locale.value === "hu" ? "hu-HU" : "en-US"));

const monthLabel = computed(() =>
    new Intl.DateTimeFormat(intlLocale.value, {
        timeZone: "Europe/Budapest",
        month: "long",
    }).format(now)
);

const weekdayLabel = computed(() =>
    new Intl.DateTimeFormat(intlLocale.value, {
        timeZone: "Europe/Budapest",
        weekday: "long",
    }).format(now)
);

const todayMenus = computed(() => menuStore.getMenusForDate(todayBudapestKey()));
</script>

<template>
    <section class="today-card">
        <div class="today-main">
            <span class="day-number">{{ dayNumber }}</span>
            <div class="day-meta">
                <span class="weekday">{{ weekdayLabel }}</span>
                <span class="month">{{ monthLabel }}</span>
            </div>
        </div>

        <div class="today-status">
            <template v-if="todayMenus.length">
                <i class="bi bi-check2-circle me-2"></i>
                <span>
                    <strong>{{ todayMenus.length }}</strong>
                    {{ $t('menu.today.count', todayMenus.length) }}
                </span>
            </template>
            <template v-else>
                <i class="bi bi-calendar-plus me-2"></i>
                <span>{{ $t('menu.today.empty') }}</span>
            </template>
        </div>
    </section>
</template>

<style scoped>
.today-card {
    border-radius: var(--radius-md);
    padding: 1.25rem 1.25rem 1rem;
    background:
        linear-gradient(var(--bs-body-bg), var(--bs-body-bg)) padding-box,
        var(--grad-orange) border-box;
    border: 2px solid transparent;
    color: var(--bs-body-color);
}

.today-main {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.day-number {
    font-family: "Caveat Brush", cursive;
    font-size: 64px;
    line-height: 1;
    color: var(--orange);
}

.day-meta {
    display: flex;
    flex-direction: column;
    line-height: 1.2;
}

.weekday {
    font-family: "Caveat Brush", cursive;
    font-size: 28px;
    color: var(--bs-emphasis-color);
    text-transform: uppercase;
}

.month {
    font-size: var(--small-text);
    color: var(--bs-secondary-color);
    text-transform: capitalize;
}

.today-status {
    margin-top: 0.75rem;
    padding-top: 0.75rem;
    border-top: 1px dashed var(--bs-border-color);
    font-size: var(--small-text);
    color: var(--bs-secondary-color);
    display: flex;
    align-items: center;
}

.today-status strong {
    color: var(--bs-emphasis-color);
    margin-right: 0.25rem;
}

@media (max-width: 576px) {
    .today-card {
        padding: 1rem;
    }

    .day-number {
        font-size: 48px;
    }

    .weekday {
        font-size: 22px;
    }
}
</style>
