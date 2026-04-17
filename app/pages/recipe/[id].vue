<script setup lang="ts">
import type Recipe from "~/models/Recipe";
import RecipeDetails from '~/components/recipe/RecipeDetails.vue';
import { useRecipeStore } from '~/stores/recipe';

const route = useRoute();
const recipeStore = useRecipeStore();

const recipeId = Number(route.params.id);

if (!recipeStore.getAllRecipes().length) {
    await recipeStore.loadRecipes();
}

const foundRecipe = recipeStore.getRecipeById(recipeId);

if (!foundRecipe) {
    await navigateTo('/recipes', { replace: true });
}

const recipe = foundRecipe as Recipe;
</script>

<template>
    <RecipeDetails :recipe="recipe" />
</template>