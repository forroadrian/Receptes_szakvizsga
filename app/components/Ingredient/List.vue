<script setup lang="ts">
const props = defineProps<{
    results: any,
    loading: boolean,
    description: string,
    hasIngredients: boolean,
}>()
</script>
<template>
    <div class="g-3 row mb-5 mt-4 align-items-start">
        <template v-if="results.length > 0">
            <div class="d-flex col-xl-4 col-lg-6 col-sm-12 flex-row justify-content-center card-enter"
                v-for="(ingredient, index) in results" :key="`${ingredient.id}`"
                :style="{ animationDelay: `${index * 50}ms` }">
                <IngredientCard :ingredient="ingredient" @delete="$emit('delete', ingredient)"
                    @edit="$emit('edit', ingredient)" />
            </div>
        </template>
        <div v-else-if="!loading" class="empty-state d-flex flex-column align-items-center py-5">
            <div class="empty-icon">
                <i :class="hasIngredients ? 'bi bi-search' : 'bi bi-basket2'"></i>
            </div>
            <p class="empty-title">{{ description }}</p>
            <p class="empty-hint" v-if="!hasIngredients">Add hozzá az első alapanyagod a fenti gombbal.</p>
        </div>
    </div>
</template>

<style scoped>
@keyframes card-in {
    from {
        opacity: 0;
        transform: translateY(12px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.card-enter {
    animation: card-in 0.3s ease both;
}

.empty-state {
    gap: 12px;
}

.empty-icon {
    width: 64px;
    height: 64px;
    border-radius: 16px;
    background: var(--accent-soft);
    border: 1.5px solid var(--accent-border);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    color: var(--bs-secondary-color);
}

.empty-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--bs-body-color);
    margin: 0;
}

.empty-hint {
    font-size: 14px;
    color: var(--bs-secondary-color);
    margin: 0;
}
</style>