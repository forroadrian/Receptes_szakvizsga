<script setup lang="ts">
const HUNGARIAN_MONTHS = [
    "Január",
    "Február",
    "Március",
    "Április",
    "Május",
    "Június",
    "Július",
    "Augusztus",
    "Szeptember",
    "Október",
    "November",
    "December",
];

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
</script>

<template>
    <component :is="is" class="month-picker d-flex align-items-center justify-content-center gap-3 mb-3">
        <button type="button" class="nav-btn" aria-label="Előző hónap" @click="emit('prev')">
            <i class="bi bi-arrow-left"></i>
        </button>
        <span class="month text-truncate">{{ year }}. {{ HUNGARIAN_MONTHS[month] }}</span>
        <button type="button" class="nav-btn" aria-label="Következő hónap" @click="emit('next')">
            <i class="bi bi-arrow-right"></i>
        </button>
        <button type="button" class="today-btn ms-2" @click="emit('today')">Ma</button>
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

.today-btn {
    font-size: var(--small-text);
    font-weight: 600;
    border: 1px solid var(--pill-border);
}
</style>
