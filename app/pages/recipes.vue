<script setup lang="ts">
import { computed, onMounted } from "vue";
import Button from "~/components/Button.vue";
import CategoryTags from "~/components/recipe/CategoryTags.vue";
import { useRecipeStore } from "~/stores/recipe";
import { useRecipeFilterStore } from "~/stores/recipeFilters";

const recipeStore = useRecipeStore();
const filterStore = useRecipeFilterStore();
const user = useSupabaseUser();

const activeFilterCount = computed(() => filterStore.getActiveFilterCount());

const needsLoginForTab = computed(() => {
    return !user.value && filterStore.activeTab !== "default";
});

const handleTabClick = (tab: any) => {
    filterStore.activeTab = tab;
};

onMounted(async () => {
    if (!recipeStore.getAllRecipes.length) {
        await recipeStore.loadRecipes();
    }

    if (!filterStore.mealOptions.length && !filterStore.typeOptions.length) {
        await filterStore.loadCategories();
    }
});
</script>

<template>
    <RecipeModal />

    <section class="recipes-page">
        <div class="recipes-shell mx-auto p-5">
            <h1 class="recipes-title mb-2">Receptek</h1>
            <p class="recipes-subtitle mb-4">
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Sed ut perspiciatis, unde omnis iste natus
            </p>

            <div class="row align-items-center justify-content-between">
                <div class="col-lg-9 col-md-8 search-wrap my-3">
                    <SearchBar v-model="filterStore.search" placeholder="Keress keresési szó vagy recept alapján..."
                        class="recipes-search w-100" />
                </div>

                <div class="filter-button col-lg-2 col-md-3 col-sm-6 mx-sm-auto">
                    <Button outline icon="bi bi-funnel" class="w-100 px-5 text-nowrap" data-bs-toggle="offcanvas"
                        data-bs-target="#recipeFiltersOffcanvas" aria-controls="recipeFiltersOffcanvas">
                        Szűrők
                        <span v-if="activeFilterCount" class="filter-count d-inline-flex me-3">
                            {{ activeFilterCount }}
                        </span>
                    </Button>
                </div>
            </div>

            <nav class="recipes-tabs mt-3">
                <ul class="d-flex flex-wrap list-unstyled gap-4">
                    <li>
                        <button type="button" class="tab-btn" :class="{ active: filterStore.activeTab === 'default' }"
                            @click="handleTabClick('default')">
                            Alapértelmezett
                        </button>
                    </li>
                    <li>
                        <button type="button" class="tab-btn" :class="{ active: filterStore.activeTab === 'own' }"
                            @click="handleTabClick('own')">
                            Saját
                        </button>
                    </li>
                    <li>
                        <button type="button" class="tab-btn" :class="{ active: filterStore.activeTab === 'saved' }"
                            @click="handleTabClick('saved')">
                            Kedvelt
                        </button>
                    </li>
                    <li>
                        <button type="button" class="tab-btn" :class="{ active: filterStore.activeTab === 'tried' }"
                            @click="handleTabClick('tried')">
                            Kipróbált
                        </button>
                    </li>
                    <li>
                        <button type="button" class="tab-btn" :class="{ active: filterStore.activeTab === 'ai' }"
                            @click="handleTabClick('ai')">
                            AI ajánlás
                        </button>
                    </li>
                </ul>
            </nav>

            <div v-if="needsLoginForTab" class="text-center py-4">
                <p class="fw-bold">Ehhez a funkcióhoz be kell jelentkezned!</p> 
                <Button @click="navigateTo('/login')"
                    color="orange" class="mx-auto" icon="bi bi-box-arrow-in-right" icon-position="right"> 
                    Tovább a belépéshez 
                </Button>
            </div>

            <div v-if="!needsLoginForTab && !filterStore.filteredRecipes.length" class="text-center py-5">
                <p class="mb-0 fw-bold py-3">
                    Nincs a szűrésnek megfelelő recept!
                </p>
                <Button v-if="user" icon="bi bi-plus-lg" color="orange" class="mx-auto my-3">
                    Új recept hozzáadása
                </Button>
            </div>

            <div v-if="!needsLoginForTab && filterStore.filteredRecipes.length" class="row">
                <div v-if="user"
                    class="addRecipe col-12 col-md-6 col-lg-4 my-sm-4 d-flex justify-content-center align-items-center"
                    data-bs-toggle="modal" data-bs-target="#openAddRecipeModal">
                    <div class="row text-center py-4">
                        <span class="plus-icon">+</span>
                        <p>Új recept hozzáadása</p>
                    </div>
                </div>

                <div v-for="recipe in filterStore.filteredRecipes"
                    class="recipe-cards col-12 col-md-6 col-lg-4 my-sm-4 ">
                    <NuxtLink :to="`/recipe/${recipe.id}`" class="text-decoration-none text-reset h-100 d-block">
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

                                <div v-if="recipe.categories?.length" class="mb-3">
                                    <div>
                                        <CategoryTags :categories="recipe.categories" class="d-flex justify-content-center" />
                                    </div>
                                </div>
                            </template>

                            <template #footer>
                                <div class="row pt-2">
                                    <div class="col-12 text-center small my-auto">
                                        <div>
                                            <strong>
                                                <i class="bi bi-exclamation-triangle-fill p-2"></i>
                                                Allergént tartalmaz:
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
                    <p id="recipeFiltersOffcanvasLabel" class="offcanvas-title fw-bold fs-5">
                        Szűrők
                        <span v-if="activeFilterCount" class="ms-2 text-muted">
                            ({{ activeFilterCount }} aktív)
                        </span>
                    </p>
                    <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Bezárás"></button>
                </div>

                <div class="offcanvas-body">
                    <Button :outline="true" type="button" class="deleteAll grad m-auto w-75" 
                        @click="filterStore.clearFilters"> Kijelölések törlése
                    </Button>
                    <div class="filters-panel offcanvas-filters">
                        <div class="filter-item">
                            <p class="filter-title">Időtartam</p>
                            <CategoryTags :categories="filterStore.durationCategories" interactive v-model="filterStore.selectedDurationId" />
                        </div>

                        <div class="filter-item">
                            <p class="filter-title">Étkezés</p>
                            <CategoryTags :categories="filterStore.mealOptions" interactive v-model="filterStore.selectedMealId" />
                        </div>

                        <div class="filter-item">
                            <p class="filter-title">Típus</p>
                            <CategoryTags :categories="filterStore.typeOptions" interactive v-model="filterStore.selectedTypeId" />
                        </div>
                        <div class="filter-item" v-if="user">
                            <div class="d-flex mb-2">
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
                            <p class="filter-title mb-3">Allergén, ételérzékenység</p>
                            <SearchBar v-model="filterStore.allergenSearch" placeholder="Allergén neve / típusa..."
                                class="w-100" />
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
    height: 700px;
    border: 2px dashed var(--bs-emphasis-color);
    border-radius: var(--radius-sm);
}

.plus-icon {
    font-size: var(--medium-icon-size);
}

.recipes-tabs {
    padding: 0 10px;
}

.tab-btn {
    background: none;
    border: none;
}

.addRecipe,
.tab-btn {
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

.filter-item {
    padding: 20px 0;
}

.filter-title,
.filter-count {
    font-weight: 700;
}

.filter-count {
    align-items: center;
    justify-content: center;
    min-width: 20px;
    font-size: 12px;
    height: 20px;
    margin: 0px 5px;
    border-radius: var(--radius-rounded);
    background: var(--bs-emphasis-color);
    color: var(--bs-body-bg);
}

@media (max-width: 992px) {
    .recipes-tabs ul {
        justify-content: center;
    }
}

@media (max-width: 768px) {
    .addRecipe {
        max-height: 150px;
        margin: 30px 0px;
    }
}
</style>