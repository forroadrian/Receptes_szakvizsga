<script setup lang="ts">
import RecipeDetails from '~/components/recipe/RecipeDetails.vue';
import { useRecipeStore } from '~/stores/recipe';

const route = useRoute();
const recipeStore = useRecipeStore();
const { t } = useI18n();

const recipeId = Number(route.params.id);

if (!Number.isInteger(recipeId) || recipeId <= 0) {
    throw createError({ statusCode: 404, statusMessage: t('recipe.details.notFound'), fatal: true });
}

if (!recipeStore.getAllRecipes().length) {
    await recipeStore.loadRecipes();
}

if (!recipeStore.getRecipeById(recipeId)) {
    throw createError({ statusCode: 404, statusMessage: t('recipe.details.notFound'), fatal: true });
}
</script>

<template>
    <RecipeDetails />
</template>