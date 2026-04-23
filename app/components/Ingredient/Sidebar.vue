<script setup lang="ts">
const emit = defineEmits<{
    (e: "jump", ingredientId: number): void;
    (e: "open-missing"): void;
}>();
</script>

<template>
    <aside class="ingredient-sidebar">
        <IngredientFreshnessCard />

        <IngredientNextExpiringCard @jump="(id: number) => emit('jump', id)" />

        <IngredientExpiringWithinWeekList @jump="(id: number) => emit('jump', id)" />

        <button
            type="button"
            class="missing-btn w-100"
            @click="emit('open-missing')"
        >
            <i class="bi bi-stars me-2"></i>
            {{ $t('pantry.sidebar.missingBtn') }}
        </button>
    </aside>
</template>

<style scoped>
.ingredient-sidebar {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.missing-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.65rem 1rem;
    border-radius: var(--radius-sm);
    font-weight: 600;
    cursor: pointer;
    color: var(--bs-emphasis-color);
    border: 2px solid transparent;
    background:
        linear-gradient(var(--bs-body-bg), var(--bs-body-bg)) padding-box,
        var(--grad-orange) border-box;
    transition: color 0.15s ease-in;
}

.missing-btn:hover {
    color: var(--orange);
}

.missing-btn i {
    font-size: 1.1rem;
}

@media (max-width: 991px) {
    .ingredient-sidebar {
        gap: 0.75rem;
    }
}
</style>
