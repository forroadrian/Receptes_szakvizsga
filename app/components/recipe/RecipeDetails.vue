<script setup lang="ts">
import SimilarRecipes from "~/components/recipe/SimilarRecipes.vue";
import { useRecipeStore } from "~/stores/recipe";
import CategoryTags from "~/components/recipe/CategoryTags.vue";

const route = useRoute();
const colorMode = useColorMode();
const recipeStore = useRecipeStore();

const recipeId = Number(route.params.id);

const buttonColor = computed(() => {
    return colorMode.value === "dark" ? "soft" : "dark";
});

onMounted(async () => {
    if (!recipeStore.getAllRecipes.length) {
        await recipeStore.loadRecipes();
    }
});

const recipe = computed(() => {
    return recipeStore.getRecipeById(recipeId);
});
</script>
<template>
    <div class="container py-5" v-if="recipe">
        <p @click="$router.back()" class="mb-5 p-0 back-link">
            <i class="bi bi-arrow-left"></i> Vissza
        </p>

        <div class="recipe-layout">
            <section class="recipe-main-top">
                <div>
                    <div class="recipe-image">
                        <div class="icons d-flex w-100">
                            <span><i class="bi bi-share"></i></span>
                            <div>
                                <span><i class="bi bi-pencil-square"></i></span>
                                <span><i class="bi bi-bookmark-plus"></i></span>
                            </div>
                        </div>
                        <img src="/images/background.webp" class="img-fluid rounded w-100 h-100" alt="Recept képe" />
                    </div>
                </div>

                <section>
                    <div class="recipe-description mt-5 ps-lg-2">
                        <h2>{{ recipe.name }}</h2>
                        <CategoryTags :categories="recipe.categories" />

                        <p>{{ recipe.description }}</p>

                        <div class="d-flex gap-5 recipe-meta-data">
                            <span><i class="bi bi-clock me-1"></i> {{ recipe.time }} perc</span>
                            <span><i class="bi bi-people me-2"></i> {{ recipe.servings }} fő</span>
                        </div>
                    </div>
                </section>
            </section>
            <aside class="recipe-aside">
                <div class="recipeButtons">
                    <ClientOnly>
                        <Button :color="buttonColor" iconPosition="right" class="w-100 mb-3" outline>
                            Kipróbálatlan
                        </Button>
                        <Button to="/recipes" color="green" class="mb-3" icon="bi bi-plus-circle" iconPosition="left">
                            Hozzáadás menühöz...
                        </Button>
                    </ClientOnly>
                </div>

                <div class="ingredient-list p-3">
                    <h3 class="text-center mt-3">Hozzávalók</h3>
                    <ul class="p-0">
                        <li v-for="ingredient in recipe?.ingredients" class="border-bottom d-flex">
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
    <div v-else class="container py-5">
        <p>A recept nem található.</p>
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