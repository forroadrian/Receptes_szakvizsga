<script setup lang="ts">
const colorMode = useColorMode()

import Recipe from '~/models/Recipe';
const route = useRoute();
console.log(route.params.id);
const recipes = ref<Recipe[]>([
    new Recipe({
        id: 1,
        author_id: 101,
        name: 'Lorem ipsum dolor',
        description: 'Aperiam ipsum adipisicing. Nisi quasi error aliquam laborum',
        time: 120,
        servings: 4,
        created_at: new Date(),
        last_edit: new Date(),
        is_ai_generated: false,
        active: true
    }),
    new Recipe({
        id: 2,
        author_id: 101,
        name: 'Lorem ipsum dolor',
        description: 'Aperiam ipsum adipisicing. Nisi quasi error aliquam laborum',
        time: 120,
        servings: 4,
        created_at: new Date(),
        last_edit: new Date(),
        is_ai_generated: false,
        active: true
    })
]);

const filterButtonColor = computed(() => {
    return colorMode.value === 'dark' ? 'light' : 'dark'
})

const search = ref('')
const activeDuration = ref('all');
const typeOptions = ['összes', 'sós', 'édes', 'leves', 'főétel', 'saláta', 'tészta', 'desszert'];
const mealOptions = ['reggeli', 'ebéd', 'vacsora', 'snack'];
const allergenSearch = ref('');



const durationOptions = [
    { label: 'Összes', value: 'all' },
    { label: '0–30 perc', value: 'short' },
    { label: '30–60 perc', value: 'medium' },
    { label: '60+ perc', value: 'long' },
]

</script>

<template>
    <section class="recipes-page">
        <div class="recipes-shell mx-auto p-5">
            <h1 class="recipes-title mb-2">Receptek</h1>
            <p class="recipes-subtitle mb-4">
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Sed ut perspiciatis, unde omnis iste natus
            </p>

            <div class="row align-items-center justify-content-between">
                <div class="col-lg-9 col-md-8 search-wrap my-3">
                    <SearchBar v-model="search" placeholder="Keress keresési szó vagy recept alapján..."
                        class="recipes-search w-100" />
                </div>

                <div class="col-lg-2 col-md-3 col-sm-6 mx-sm-auto">
                    <Button :color="filterButtonColor" outline icon="bi bi-funnel" class="w-100 px-4 text-nowrap"
                        data-bs-toggle="offcanvas" data-bs-target="#recipeFiltersOffcanvas"
                        aria-controls="recipeFiltersOffcanvas">
                        Szűrők
                    </Button>
                </div>
            </div>

            <nav class="recipes-tabs mt-3">
                <ul class="d-flex flex-wrap list-unstyled gap-4">
                    <li>
                        <button type="button" class="tab-btn active">Alapértelmezett</button>
                    </li>
                    <li>
                        <button type="button" class="tab-btn">Saját</button>
                    </li>
                    <li>
                        <button type="button" class="tab-btn">Kedvelt</button>
                    </li>
                    <li>
                        <button type="button" class="tab-btn">Kipróbált</button>
                    </li>
                    <li>
                        <button type="button" class="tab-btn">AI ajánlás</button>
                    </li>
                </ul>
            </nav>

            <div class="row">
                <div
                    class="addRecipe col-12 col-md-6 col-lg-4 my-sm-4 d-flex justify-content-center align-items-center">
                    <div class="row text-center py-4">
                        <span class="plus-icon">+</span>
                        <p>Új recept hozzáadása</p>
                    </div>
                </div>

                <div v-for="recipe in recipes" class="col-12 col-md-6 col-lg-4 my-sm-4">
                    <NuxtLink :to="`/recipe`" class="text-decoration-none text-reset h-100 d-block">
                    <CardBase orientation="vertical" variant="outline" media-position="top" body-class="w-100"
                        metadata-class="w-100" footer-class="w-100" class="h-100">
                        <template #media>
                            <div class="row pt-4">
                                <div class="d-flex justify-content-center">
                                    <img src="/images/background.webp" alt="recipename image" width="90%">
                                </div>
                            </div>
                        </template>

                        <template #header>
                            <CardHeader class="w-100 py-3 justify-content-center">
                                <CardTitle :rank="5">{{ recipe.name }}</CardTitle>
                                <template #actions>
                                    <span title="User">👤</span>
                                </template>
                            </CardHeader>
                        </template>

                        <template #body>
                            <div class="row justify-content-center">
                                <div class="col-10 col-lg-8">
                                    <p class="text-center mb-3 small">
                                        {{ recipe.description }}
                                    </p>
                                </div>
                            </div>
                        </template>

                        <template #metadata>
                            <div class="row justify-content-center mb-3 py-2">
                                <div class="col-auto">
                                    <i class="bi bi-clock me-1"></i>
                                    {{ recipe.time }} perc
                                </div>
                                <div class="col-auto">
                                    <i class="bi bi-people me-1"></i>
                                    {{ recipe.servings }} fő
                                </div>
                            </div>

                            <div class="row justify-content-center mb-3">
                                <div class="col-auto">
                                    <!-- <CardTags :items="recipe.tags" /> -->
                                </div>
                            </div>
                        </template>

                        <template #footer>
                            <div class="row pt-2">
                                <div class="col-12 text-center small my-auto">
                                    <div>
                                        <strong><i class="bi bi-exclamation-triangle-fill p-2"></i> Allergént tartalmaz:
                                        </strong>
                                    </div>
                                </div>
                            </div>
                        </template>
                    </CardBase>
                </NuxtLink>
                </div>
            </div>

            <div id="recipeFiltersOffcanvas" class="offcanvas offcanvas-end" tabindex="-1"
                aria-labelledby="recipeFiltersOffcanvasLabel">
                <div class="offcanvas-header">
                    <h5 id="recipeFiltersOffcanvasLabel" class="offcanvas-title fw-bold">Szűrők</h5>
                    <i  class="btn-close" data-bs-dismiss="offcanvas" aria-label="Bezárás"></i>
                </div>

                <div class="offcanvas-body">
                    <div class="filters-panel offcanvas-filters">
                        <div class="filter-item">
                            <p class="filter-title">Időtartam</p>
                            <div class="d-flex flex-wrap gap-2">
                                <button v-for="option in durationOptions" type="button" class="filter-pill"
                                    @click="activeDuration = option.value">
                                    {{ option.label }}
                                </button>
                            </div>
                        </div>
                        <div class="filter-item">
                            <p class="filter-title">Étkezés</p>
                            <div class="d-flex flex-wrap gap-2">
                                <button v-for="meal in mealOptions" type="button" class="filter-pill">
                                    {{ meal }}
                                </button>
                            </div>
                        </div>

                        <div class="filter-item">
                            <p class="filter-title">Típus</p>
                            <div class="d-flex flex-wrap gap-2">
                                <button v-for="type in typeOptions" type="button" class="filter-pill">
                                    {{ type }}
                                </button>
                            </div>
                        </div>

                        <div class="filter-item">
                            <div class="d-flex align-items-center justify-content-between mb-2">
                                <p class="filter-title mb-0">Nem kedvelt alapanyagok</p>
                            </div>
                            <div class="form-check mb-2">
                                <input class="form-check-input" name="isdisliked" type="radio" checked id="ondisliked">
                                <label class="form-check-label" for="ondisliked">Számít</label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" name="isdisliked" type="radio" id="offdisliked">
                                <label class="form-check-label" for="offdisliked">Nem számít</label>
                            </div>
                        </div>
                        <div class="filter-item">
                            <div class="row g-2">
                                <p class="filter-title mb-0">Allergén, ételérzékenység</p>
                                <div class="col-12">
                                    <SearchBar v-model="allergenSearch" placeholder="Allergén neve / típusa..."
                                        class=" w-100" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped>
.search-wrap input {
    height: 50px;
}

.addRecipe {
    border-radius: var(--radius-sm);
}

.plus-icon {
    font-size: var(--medium-icon-size);
}

.addRecipe {
    border: 2px dashed var(--bs-emphasis-color);
    cursor: pointer;
}

.recipes-tabs {
    padding: 0px 10px;
}

.tab-btn {
    background: none;
    border: none;
    color: #6b7280;
    cursor: pointer;
}

.tab-btn:hover,
.tab-btn.active {
    color: var(--dark);
}

.tab-btn.active {
    border-bottom: 2px solid var(--bs-emphasis-color);
    font-weight: 500;
}

.tab-link.active,
.tab-link:hover {
    color: var(--bs-emphasis-color);
}

.filter-pill {
    background-color: var(--soft);
    border: 2px solid var(--bs-gray-600);
}

.filter-pill.active {
    border: 2px solid var(--green) !important;
    color: var(--green);
}

.filter-item {
    padding: 20px 0px;
}

.filter-title{
    font-weight: 700
}

.filter-pill,
.form-check-label {
    border-radius: var(--radius-sm);
    font-size: var(--small-text);
}

@media (max-width: 992px) {
    .recipes-tabs ul{
        justify-content: center;
    }

}
</style>