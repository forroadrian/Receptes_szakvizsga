<script setup lang="ts">
import { computed, onMounted } from "vue";
import Button from "~/components/Button.vue";
import FormInput from "~/components/FormInput.vue";
import { useRecipeStore } from "~/stores/recipe";
import { useRecipeFilterStore } from "~/stores/recipeFilters";
import Pills from "~/components/Pills.vue";

const recipeStore = useRecipeStore();
const filterStore = useRecipeFilterStore();
const user = useSupabaseUser();
const allergyWarnings = useRecipeAllergyWarnings();
const isHydrated = ref(false);

onMounted(async() => {
    isHydrated.value = true;
    if (user.value) {
        await allergyWarnings.loadUserAllergies();
        await filterStore.loadUserDislikedIngredientIds();
    }
});

const activeFilterCount = computed(() => filterStore.getActiveFilterCount());

const needsLoginForTab = computed(() => {
    return !user.value && filterStore.activeTab !== "default";
});

const handleTabClick = (tab: any) => {
    filterStore.activeTab = tab;
};

if (!recipeStore.getAllRecipes().length) {
    await recipeStore.loadRecipes();
}

if (!filterStore.mealOptions.length && !filterStore.typeOptions.length) {
    await filterStore.loadCategories();
}

if (!filterStore.allAllergies.length) {
    await filterStore.loadAllergies();
}
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
                        <span v-if="isHydrated && activeFilterCount" class="filter-count d-inline-flex me-3">
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
                <Button @click="navigateTo('/login')" color="orange" class="mx-auto" icon="bi bi-box-arrow-in-right"
                    icon-position="right">
                    Tovább a belépéshez
                </Button>
            </div>

            <div v-if="!needsLoginForTab && !filterStore.filteredRecipes.length" class="text-center py-5">
                <p class="mb-0 fw-bold py-3">
                    Nincs a szűrésnek megfelelő recept!
                </p>
                <Button v-if="user" icon="bi bi-plus-lg" color="orange" class="mx-auto my-3"
                :data-bs-toggle="user ? 'modal' : null" :data-bs-target="user ? '#openAddRecipeModal' : null">
                    Új recept hozzáadása
                </Button>
            </div>

            <div v-if="!needsLoginForTab && filterStore.filteredRecipes.length" class="row">
                <div v-if="user" class="addRecipe col-12 col-md-6 col-lg-4 my-sm-4 d-flex justify-content-center align-items-center"
                    :data-bs-toggle="user ? 'modal' : null" :data-bs-target="user ? '#openAddRecipeModal' : null">
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
                                <CardHeader class="w-100 card-header my-4" :class="{ 'pt-5': filterStore.activeTab !== 'default' }">
                                    <CardTitle :rank="5">{{ recipe.name }}</CardTitle>
                                    <template #actions>
                                        <span title="User" class="top-0 start-50 translate-middle" v-if="filterStore.activeTab === 'own'"><i class="bi bi-file-earmark-person fs-4"></i></span>
                                        <span title="User" class="top-0 start-50 translate-middle" v-if="filterStore.activeTab === 'saved'"><i class="bi bi-bookmark-check"></i></span>
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

                                <div class="mb-3">
                                    <div v-if="recipe.categories?.length">
                                          <Pills :pills="dataToPillTag(recipe.categories, BASIC_CONVERSION)"
                                            class="d-flex justify-content-center" />
                                    </div>
                                </div>
                            </template>

                            <template #footer>
                                <div class="row pt-2">
                                    <div class="col-12 text-center small my-auto text-danger">
                                        <template
                                            v-if="isHydrated && user && allergyWarnings.hasAllergyWarning(recipe)">
                                            <strong>
                                                <i class="bi bi-exclamation-triangle-fill p-2"></i> Figyelem! Allergént
                                                tartalmaz:
                                            </strong>{{ allergyWarnings.getMatchingAllergyNames(recipe) }}
                                        </template>
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
                        <span v-if="isHydrated && activeFilterCount" class="ms-2 text-muted">
                            ({{ activeFilterCount }} aktív)
                        </span>
                    </p>
                    <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Bezárás"></button>
                </div>

                <div class="offcanvas-body">
                    <Button :outline="true" type="button" class="deleteAll grad m-auto w-75"
                        @click="filterStore.clearFilters">
                        Kijelölések törlése
                    </Button>
                    <div class="filters-panel offcanvas-filters">
                        <div class="filter-item">
                            <p class="filter-title">Időtartam</p>
                            <Pills :pills="dataToPillTag(filterStore.durationCategories as any, BASIC_CONVERSION)" interactive
                                v-model="filterStore.selectedDurationId" />
                        </div>

                        <div class="filter-item">
                            <p class="filter-title">Étkezés</p>
                            <Pills :pills="dataToPillTag(filterStore.mealOptions as any, BASIC_CONVERSION)" interactive
                                v-model="filterStore.selectedMealId" />
                        </div>

                        <div class="filter-item">
                            <p class="filter-title">Típus</p>
                            <Pills :pills="dataToPillTag(filterStore.typeOptions as any, BASIC_CONVERSION)" interactive
                                v-model="filterStore.selectedTypeId" />
                        </div>
                        <div class="filter-item" v-if="user">
                            <div class="d-flex mb-2">
                                <p class="filter-title mb-0">Nem kedvelt alapanyagok</p>
                            </div>
                            <div class="form-check mb-2">
                                <input id="ondisliked" v-model="filterStore.respectDislikedIngredients"
                                    class="form-check-input" name="isdisliked" type="radio" :value="true">
                                <label class="form-check-label" for="ondisliked">Számít</label>
                            </div>
                            <div class="form-check">
                                <input id="offdisliked" v-model="filterStore.respectDislikedIngredients"
                                    class="form-check-input" name="isdisliked" type="radio" :value="false">
                                <label class="form-check-label" for="offdisliked">Nem számít</label>
                            </div>
                        </div>

                        <div class="filter-item">
                            <p class="filter-title mb-3">Allergén, ételérzékenység</p>
                            <FormInput v-model="filterStore.allergenSearch" placeholder="Allergia keresése..." />

                            <div v-if="filterStore.selectedAllergyPills.length" class="mt-3">
                                <p class="small text-muted mb-2">Kiválasztott allergiák:</p>
                                <Pills :pills="filterStore.selectedAllergyPills" removable @remove="filterStore.removeSelectedAllergy" />
                            </div>

                            <div v-if="filterStore.filteredAllergyPills.length" class="mt-3">
                                <p class="small text-muted mb-2">Elérhető allergiák:</p>
                                <Pills :pills="filterStore.filteredAllergyPills" interactive @chose="filterStore.addSelectedAllergy" />
                            </div>

                            <div v-if="!filterStore.selectedAllergyPills.length && !filterStore.filteredAllergyPills.length" class="mt-3">
                                <p class="small text-muted">Nincsenek allergiák.</p>
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

.card-header, .offcanvas-filters .form-check-input[type="radio"] {
    position: relative;
}

.card-header span{
    position: absolute;
}

.offcanvas-filters .form-check-input[type="radio"] {
  appearance: none;
  width: 20px;
  height: 20px;
  border: 2px solid var(--pill-border);
  transition: .3s;
}

.offcanvas-filters .form-check-input[type="radio"]:hover {
  border-color: var(--orange);
}

.offcanvas-filters .form-check-input[type="radio"]:checked {
  border: 0;
  background: var(--grad-orange);
}

.offcanvas-filters .form-check-input[type="radio"]:checked::after {
  content: "";
  position: absolute;
  inset: 50%;
  width: 8px;
  height: 8px;
  background: var(--text-light);
  transform: translate(-50%, -50%);
}

.offcanvas-filters .form-check-input[type="radio"]:focus {
  outline: none;
  box-shadow: none;
}

.tab-btn {
    background: none;
    border: none;
}

.addRecipe,
.tab-btn,
.offcanvas-filters .form-check-label,
.offcanvas-filters .form-check-input[type="radio"] {
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
.filter-count, .card-header{
    justify-content: center;
}

.filter-count {
    align-items: center;
    min-width: 20px;
    font-size: 12px;
    height: 20px;
    margin: 0px 5px;
    background: var(--bs-emphasis-color);
    color: var(--bs-body-bg);
}

.filter-count,
.offcanvas-filters .form-check-input[type="radio"],
.offcanvas-filters .form-check-input[type="radio"]:checked::after {
    border-radius: var(--radius-rounded);
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