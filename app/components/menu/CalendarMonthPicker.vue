<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
    defineProps<{
        year: number;
        month: number;
        is?: string;
    }>(),
    { is: "h3" }
);

const emit = defineEmits<{
    (e: "prev"): void;
    (e: "next"): void;
    (e: "today"): void;
}>();

const { locale } = useI18n();
const intlLocale = computed(() => (locale.value === "hu" ? "hu-HU" : "en-US"));

const monthLabel = computed(() => {
    const date = new Date(props.year, props.month, 1);
    return new Intl.DateTimeFormat(intlLocale.value, {
        year: "numeric",
        month: "long",
    }).format(date);
});
</script>

<template>
    <component :is="is" class="month-picker d-flex align-items-center justify-content-center gap-3 mb-3">
        <button type="button" class="nav-btn" :aria-label="$t('menu.calendar.prevMonth')" @click="emit('prev')">
            <i class="bi bi-arrow-left"></i>
        </button>
        <span class="month text-truncate">{{ monthLabel }}</span>
        <button type="button" class="nav-btn" :aria-label="$t('menu.calendar.nextMonth')" @click="emit('next')">
            <i class="bi bi-arrow-right"></i>
        </button>
        <button type="button" class="today-btn ms-2" @click="emit('today')">{{ $t('menu.calendar.today') }}</button>
    </component>
</template>

<style scoped>
.month {
    min-width: 10rem;
    text-align: center;
}

.nav-btn,
.today-btn {
    background: none;
    border: none;
    color: var(--bs-emphasis-color);
    padding: 0.25rem 0.6rem;
    border-radius: var(--radius-sm);
    transition: background-color 0.15s ease-in;
    cursor: pointer;
}

.nav-btn:hover,
.today-btn:hover {
    background-color: var(--accent-soft);
}

[data-bs-theme="dark"] .nav-btn:hover,
[data-bs-theme="dark"] .today-btn:hover {
    background-color: rgba(255, 255, 255, 0.08);
}

.today-btn {
    font-size: var(--small-text);
    font-weight: 600;
    border: 1px solid var(--bs-border-color);
}
</style>
