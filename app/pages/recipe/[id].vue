<script setup lang="ts">
import RecipeDetails from '~/components/recipe/RecipeDetails.vue';
import { useRecipeStore } from '~/stores/recipe';

const route = useRoute();
const recipeStore = useRecipeStore();

const recipeId = Number(route.params.id);

if (!recipeStore.getAllRecipes().length) {
    await recipeStore.loadRecipes();
}

if (!recipeStore.getRecipeById(recipeId)) {
    await navigateTo('/recipes', { replace: true });
}
</script>

<template>
    <RecipeDetails />
</template>