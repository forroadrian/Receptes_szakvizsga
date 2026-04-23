<script setup lang="ts">
import SimilarRecipes from "~/components/recipe/SimilarRecipes.vue";
import Pills from "../Pills.vue";
import type Recipe from "~/models/Recipe";
import { useRecipeFilterStore } from "~/stores/recipeFilters";
import { useRecipeStore } from "~/stores/recipe";

const filterStore = useRecipeFilterStore();
const recipeStore = useRecipeStore();
const user = useSupabaseUser();

defineProps<{
    recipe: Recipe
}>();

const route = useRoute();
const recipeId = computed(() => Number(route.params.id));

const currentRecipe = computed(() =>
    recipeStore.getRecipeById(recipeId.value)
);

const isSaved = computed(() =>
    currentRecipe.value ? filterStore.savedRecipeIds.includes(currentRecipe.value.id) : false
);

const isTried = computed(() =>
    currentRecipe.value ? filterStore.triedRecipeIds.includes(currentRecipe.value.id) : false
);

const addRecipeToMenu = computed(() => user.value ? "/menu" : "/login");

const handleToggleSaved = async () => {
    if (!user.value) { navigateTo('/login'); return; }
    if (!currentRecipe.value) return;
    await filterStore.toggleSaved(currentRecipe.value.id);
};

const handleToggleTried = async () => {
    if (!user.value) { navigateTo('/login'); return; }
    if (!currentRecipe.value) return;
    await filterStore.toggleTried(currentRecipe.value.id);
};

onMounted(async () => {
    await filterStore.loadUserRecipeIds();
});
</script>
<template>
    <div class="container py-5">
        <NuxtLink to="/recipes" class="mb-5 back-link">
            <p><i class="bi bi-arrow-left"></i> Vissza</p>
        </NuxtLink>

        <div class="recipe-layout">
            <section class="recipe-main-top">
                <div>
                    <div class="recipe-image">
                        <div class="icons d-flex w-100">
                            <span><i class="bi bi-share"></i></span>
                            <div>
                                <span><i class="bi bi-pencil-square"></i></span>
                                <span><i class="bi bi-trash3"></i></span>
                            </div>
                        </div>
                        <img src="/images/background.webp" class="img-fluid rounded w-100" alt="Recept képe" />
                    </div>
                </div>

                <section>
                    <div class="recipe-description mt-5 ps-lg-2">
                        <h2>{{ recipe.name }}</h2>
                        <Pills :pills="dataToPillTag(recipe.categories as any, BASIC_CONVERSION)" />
                        <p>{{ recipe.description }}</p>

                        <div class="d-flex gap-5 recipe-meta-data">
                            <span><i class="bi bi-clock me-1"></i> {{ recipe.time }} perc</span>
                            <span><i class="bi bi-people me-2"></i> {{ recipe.servings }} fő</span>
                        </div>
                    </div>
                </section>
            </section>
            <aside class="recipe-aside">
                <div class="recipeButtons mb-5">
                    <ClientOnly>
                        <div class="d-flex flex-column gap-3 my-3">
                            <Button :to="addRecipeToMenu" color="green" icon="bi bi-plus-circle" iconPosition="left">
                                Hozzáadás menühöz...
                            </Button>

                            <div class="d-flex gap-3">
                                <Button v-if="currentRecipe" class="w-100" color="yellow" :outline="!isTried"
                                :icon="isTried ? 'bi bi-check-circle-fill' : 'bi bi-bookmark'" @click="handleToggleTried">
                                    {{ isTried ? 'Kipróbált' : 'Kipróbálom' }}
                                </Button>

                                <Button v-if="currentRecipe" class="w-100" color="orange" :outline="!isSaved" :icon="isSaved ? 'bi bi-star-fill' : 'bi bi-star'"
                                @click="handleToggleSaved">
                                    {{ isSaved ? 'Kedvelt' : 'Kedvelem' }}
                                </Button>
                            </div>
                        </div>
                    </ClientOnly>
                </div>

                <div class="ingredient-list p-3" v-if="recipe">
                    <h3 class="text-center mt-3">Hozzávalók</h3>
                    <ul class="p-0">
                        <li v-for="ingredient in recipe.ingredients" class="border-bottom d-flex">
                            <p>{{ ingredient.name }}</p>
                            <p>{{ ingredient.quantity }} {{ ingredient.unit }}</p>
                        </li>
                    </ul>
                </div>
            </aside>
            <section class="steps">
                <h3 class="my-lg-4">Elkészítés</h3>
                <div v-for="(step, index) in recipe.steps"
                    class="step d-flex flex-column flex-lg-row align-items-center mb-3">
                    <p class="circle flex-shrink-0">
                        <span>{{ index + 1 }}</span>
                    </p>
                    <p class="ms-lg-3">{{ step }}</p>
                </div>
            </section>
            <section class="similar-recipes">
                <h3 class="text-center">Ehhez hasonló receptek</h3>
                <div class="similar-list">
                    <SimilarRecipes />
                </div>
            </section>
        </div>
    </div>
</template>
<style scoped>
.recipe-layout {
    display: grid;
    gap: 60px;
}

.ingredient-list li,
.recipe-image .icons {
    justify-content: space-between;
    align-content: center !important;
}

.ingredient-list,
.recipe-image i,
.step .circle {
    box-shadow: 0px 5px 10px rgba(0, 0, 0, 0.2);
}

.ingredient-list p {
    margin: 10px 0px;
    padding: 10px;
}

.recipe-image {
    position: relative;
}

.recipe-image::before {
    content: "";
    inset: 0 0 auto 0;
    height: 200px;
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.5), transparent);
}

.recipe-image .icons {
    top: 20px;
    left: 0px;
}

.recipe-image .icons,
.recipe-image::before {
    position: absolute;
}

.recipe-image i {
    padding: 6px 12px;
    margin: 10px;
}

.recipe-image i,
.step .circle {
    background: var(--grad-yellow);
    color: var(--text-dark);
    font-weight: 600;
}

.step .circle span {
    display: flex;
    justify-content: center;
}

.back-link {
    text-decoration: none;
}

li {
    margin: 10px 30px !important;
}

.recipe-image img {
    box-shadow: 0 0 20px 20px -20px rgba(0, 0, 0, 0.8) !important;
}

.back-link {
    cursor: pointer;
}

@media (min-width: 992px) {
    .recipe-layout {
        grid-template-columns: minmax(0, 1fr) 360px;
        grid-template-areas:
            "main aside"
            "steps aside"
            "steps similar";
        align-items: start;
    }

    .recipe-main-top {
        grid-area: main;
    }

    .recipe-aside {
        grid-area: aside;
        width: 360px;
    }

    .steps {
        grid-area: steps;
    }

    .similar-recipes {
        grid-area: similar;
    }

    .recipe-main-top,
    .recipe-aside,
    .steps,
    .similar-recipes {
        min-width: 0;
    }
}

@media (max-width: 991.98px) {
    .recipe-layout {
        display: flex;
        flex-direction: column;
    }

    .steps,
    .recipe-description,
    .recipe-meta-data {
        text-align: center;
        justify-content: center;
    }

    .step {
        padding: 20px 40px;
    }
}
</style>