<script setup lang="ts">
const emit = defineEmits<{
    (e: "jump", dateKey: string): void;
    (e: "day-click", dateKey: string): void;
    (e: "empty-click", dateKey: string): void;
    (e: "open-month"): void;
}>();
</script>

<template>
    <aside class="menu-sidebar">
        <MenuTodayCard />

        <MenuNextUpCard @jump="(k) => emit('jump', k)" />

        <MenuUpcomingList
            @day-click="(k) => emit('day-click', k)"
            @empty-click="(k) => emit('empty-click', k)"
        />

        <button
            type="button"
            class="month-btn w-100"
            @click="emit('open-month')"
        >
            <i class="bi bi-grid-3x3-gap me-2"></i>
            {{ $t('menu.sidebar.monthlyMenus') }}
        </button>
    </aside>
</template>

<style scoped>
.menu-sidebar {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.month-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.65rem 1rem;
    border-radius: var(--radius-sm);
    font-weight: 600;
    cursor: pointer;
    background: var(--bs-body-bg);
    color: var(--bs-emphasis-color);
    border: 2px solid transparent;
    background:
        linear-gradient(var(--bs-body-bg), var(--bs-body-bg)) padding-box,
        var(--grad-orange) border-box;
    transition: color 0.15s ease-in;
}

.month-btn:hover {
    color: var(--orange);
}

.month-btn i {
    font-size: 1.1rem;
}

@media (max-width: 991px) {
    .menu-sidebar {
        gap: 0.75rem;
    }
}
</style>
