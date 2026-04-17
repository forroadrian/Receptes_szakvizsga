<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "#imports";
import { useRecipeStore } from "~/stores/recipe";

import CardBase from "../CardBase.vue";
import CardHeader from "../CardHeader.vue";
import CardMetadata from "../CardMetadata.vue";
import CardTitle from "../CardTitle.vue";

const route = useRoute();
const recipeStore = useRecipeStore();

const currentRecipeId = computed(() => Number(route.params.id));

const items = computed(() => {
    const currentRecipe = recipeStore.getRecipeById(currentRecipeId.value);
    if (!currentRecipe) return [];

    const currentCategoryIds = (currentRecipe.categories ?? []).map(c => c.id);

    return recipeStore.getAllRecipes()
        .filter(recipe => recipe.id !== currentRecipeId.value)
        .map(recipe => {
            const recipeCategoryIds = (recipe.categories ?? []).map(c => c.id);

            const common = recipeCategoryIds.filter(id =>
                currentCategoryIds.includes(id)
            ).length;

            return {
                recipe,
                score: common
            };
        })
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map(({ recipe }) => ({
            id: recipe.id, title: recipe.name,
            pageLink: `/recipe/${recipe.id}`, time: `${recipe.time} perc`, servings: `${recipe.servings} fő`
        }));
});
</script>

<template>
    <section>
        <div class="similar-recipe-list">
            <CardBase v-for="item in items" orientation="horizontal" variant="outline" media-position="topLeft"
                class="similar-recipes-card" media-class="similar-recipes-media-shell"
                media-left-class="similar-recipes-media" content-class="similar-recipes-content" header-class="w-100">
                <template #media>
                    <div class="similar-recipes-image">
                        <img src="/assets/icons/peking-duck.png" alt="Recept kép">
                    </div>
                </template>
                <template #header>
                    <CardHeader>
                        <div class="similar-recipes-header">
                            <CardTitle :rank="5" class="text-wrap">
                                {{ item.title }}
                            </CardTitle>

                            <p class="py-2">
                                <NuxtLink :to="item.pageLink"> >> Részletek</NuxtLink>
                            </p>
                        </div>
                    </CardHeader>
                </template>
                <template #metadata>
                    <CardMetadata>
                        <span class="similar-recipes-meta-item">
                            <i class="bi bi-clock me-1"></i>
                            {{ item.time }}
                        </span>

                        <span class="similar-recipes-meta-item">
                            <i class="bi bi-people me-2"></i>
                            {{ item.servings }}
                        </span>
                    </CardMetadata>
                </template>
            </CardBase>
            <p v-if="!items.length" class="text-center mt-3">
                Nincs hasonló kategóriájú recept.
            </p>
        </div>
    </section>
</template>

<style scoped>
.similar-recipes-card {
    padding: 20px !important;
    margin: 30px 0px;
}

.similar-recipes-image {
    width: 100px;
    height: 100px;
}

.similar-recipes-image img {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.similar-recipes-header {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.similar-recipes-meta-item {
    margin-right: 15px;
}

@media (max-width: 992px) {
    .similar-recipes-card {
        text-align: center !important;
    }

    .card-metadata {
        justify-content: center;
    }
}
</style>