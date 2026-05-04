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
const { t } = useI18n();
const { getRecipeImage } = useRecipeImage();
const user = useSupabaseUser();

const currentRecipeId = computed(() => Number(route.params.id));

const items = computed(() => {
    const currentRecipe = recipeStore.getRecipeById(currentRecipeId.value);
    if (!currentRecipe) return [];

    const result = [];
    const currentCategoryIds = currentRecipe.categories.map(c => c.id);

    for (const recipe of recipeStore.getAllRecipes()) {
        if (recipe.id !== currentRecipeId.value && (recipe.public || recipe.author_id === user.value?.id)) {
            let matchCount = 0;

            for (const category of recipe.categories) {
                if (currentCategoryIds.includes(category.id)) {
                    matchCount++;
                }
            }
            if (matchCount > 0) {
                result.push({
                    id: recipe.id,
                    title: recipe.name,
                    pageLink: `/recipe/${recipe.id}`,
                    time: `${recipe.time} ${t('recipe.details.minutes')}`,
                    servings: `${recipe.servings} ${t('recipe.details.people')}`,
                    score: matchCount,
                    image: getRecipeImage(recipe)
                });
            }
        }
    }
    result.sort((a, b) => b.score - a.score);

    return result.slice(0, 3);
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
                        <img :src="item.image" :alt="item.title">
                    </div>
                </template>
                <template #header>
                    <CardHeader>
                        <div class="similar-recipes-header">
                            <CardTitle :rank="5" class="text-wrap">
                                {{ item.title }}
                            </CardTitle>

                            <p class="py-2">
                                <NuxtLink :to="item.pageLink"> >> {{ $t('recipe.similar.details') }}</NuxtLink>
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
                {{ $t('recipe.similar.empty') }}
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

.similar-recipes-header a{
    color: var(--orange);
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