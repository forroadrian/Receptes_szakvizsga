<script setup lang="ts">
const props = withDefaults(
    defineProps<{
        all?: number;
        fresh?: number;
        almostExpired?: number;
        expired?: number;
    }>(),
    {
        all: 0,
        fresh: 0,
        almostExpired: 0,
        expired: 0,
    }
);

const filters = computed(() => [
    { amount: props.all, name: "Összes", icon: "bi bi-grid", colorClass: "filter--all" },
    { amount: props.fresh, name: "Friss", icon: "bi bi-leaf", colorClass: "filter--fresh" },
    { amount: props.almostExpired, name: "Hamarosan", icon: "bi bi-clock-history", colorClass: "filter--warning" },
    { amount: props.expired, name: "Lejárt", icon: "bi bi-exclamation-triangle", colorClass: "filter--expired" },
]);

const selected = ref("Összes");
</script>
<template>
    <div class="mt-4">
        <div class="segmentation">
            <button v-for="filter in filters" :key="filter.name" class="seg-btn"
                :class="[filter.colorClass, { active: selected === filter.name }]"
                @click="selected = filter.name; $emit('filter', filter.name)">
                <i :class="filter.icon" class="seg-icon d-none d-md-inline"></i>
                <span class="seg-label">{{ filter.name }}</span>
                <strong class="seg-count">{{ filter.amount }}</strong>
            </button>
        </div>
    </div>
</template>

<style scoped>
.segmentation {
    display: flex;
    background: var(--segmentation-bg);
    border: 1px solid var(--pill-border);
    border-radius: 50px;
    padding: 4px;
    box-shadow: var(--pill-shadow);
    gap: 4px;
}

.seg-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 10px 12px;
    border-radius: 50px;
    border: none;
    background: transparent;
    color: var(--pill-text-muted);
    font-family: "Poppins", sans-serif;
    font-size: var(--small-text);
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
}

.seg-btn:hover:not(.active) {
    background: var(--accent-soft);
    color: var(--pill-text);
}

.seg-icon {
    font-size: 14px;
    transition: color 0.2s ease;
}

.seg-count {
    font-weight: 700;
}

.seg-btn.active {
    font-weight: 600;
    box-shadow: inset 0 0 0 2px var(--pill-primary-strong);
}

.seg-btn.filter--all.active {
    background: var(--active-bg);
    color: var(--active-text);
    box-shadow: inset 0 0 0 2px var(--pill-primary-strong);
}

.seg-btn.filter--fresh.active {
    background: rgba(53, 165, 90, 0.15);
    color: #1e7a40;
    box-shadow: inset 0 0 0 2px var(--green);
}

.seg-btn.filter--warning.active {
    background: rgba(250, 180, 100, 0.2);
    color: #9a6d1a;
    box-shadow: inset 0 0 0 2px var(--yellow);
}

.seg-btn.filter--expired.active {
    background: rgba(165, 42, 42, 0.12);
    color: #8b1a1a;
    box-shadow: inset 0 0 0 2px #a52a2a;
}

[data-bs-theme="dark"] .segmentation {
    background: rgba(40, 40, 40, 0.9);
    border-color: rgba(80, 75, 68, 0.6);
}

[data-bs-theme="dark"] .seg-btn {
    color: rgba(180, 175, 168, 0.8);
}

[data-bs-theme="dark"] .seg-btn:hover:not(.active) {
    background: rgba(255, 255, 255, 0.06);
    color: rgba(220, 215, 208, 0.9);
}

[data-bs-theme="dark"] .seg-btn.filter--all.active {
    background: rgba(185, 122, 69, 0.18);
    color: #d4a870;
    box-shadow: inset 0 0 0 2px rgba(185, 122, 69, 0.5);
}

[data-bs-theme="dark"] .seg-btn.filter--fresh.active {
    background: rgba(53, 165, 90, 0.12);
    color: #5bbf78;
    box-shadow: inset 0 0 0 2px rgba(53, 165, 90, 0.4);
}

[data-bs-theme="dark"] .seg-btn.filter--warning.active {
    background: rgba(250, 180, 100, 0.12);
    color: #e0a850;
    box-shadow: inset 0 0 0 2px rgba(250, 180, 100, 0.35);
}

[data-bs-theme="dark"] .seg-btn.filter--expired.active {
    background: rgba(165, 42, 42, 0.15);
    color: #d06060;
    box-shadow: inset 0 0 0 2px rgba(165, 42, 42, 0.4);
}

@media (max-width: 767px) {
    .segmentation {
        flex-wrap: wrap;
        border-radius: 16px;
    }

    .seg-btn {
        flex: 1 1 calc(50% - 4px);
        min-width: 0;
        padding: 10px 8px;
        font-size: 0.75rem;
        gap: 5px;
        border-radius: 12px;
    }
}
</style>
