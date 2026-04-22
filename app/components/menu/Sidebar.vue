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

        <Button
            outline
            icon="bi bi-grid-3x3-gap"
            icon-position="left"
            class="month-btn w-100"
            @click="emit('open-month')"
        >
            Havi menük
        </Button>
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
    text-decoration: none;
    font-weight: 600;
}

@media (max-width: 991px) {
    .menu-sidebar {
        gap: 0.75rem;
    }
}
</style>
