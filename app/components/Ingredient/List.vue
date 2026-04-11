<script setup lang="ts">
const props = defineProps<{
    results: any,
    loading: boolean,
    description: string,
}>()
</script>
<template>
    <div class="g-3 row mb-5 mt-4 align-items-start">
        <template v-if="results.length > 0">
            <div class="d-flex col-xl-4 col-lg-6 col-sm-12 flex-row justify-content-center"
                v-for="ingredient in results"
                :key="`${ingredient.id}`">
                <IngredientCard :ingredient="ingredient" @delete="$emit('delete', ingredient)" @edit="$emit('edit',ingredient)"
                    :image="'images/background.webp'" />
            </div>
        </template>
        <div v-else>
            <p class="fs-2 text-center fw-bold" v-if="!loading">
                {{description}}
            </p>
        </div>
    </div>
</template>