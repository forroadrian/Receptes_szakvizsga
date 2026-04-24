<script setup lang="ts">
import { computed, onMounted } from "vue";
import Button from "~/components/Button.vue";
import FormInput from "~/components/FormInput.vue";
import { useRecipeStore } from "~/stores/recipe";
import { useRecipeFilterStore } from "~/stores/recipeFilters";
import Pills from "~/components/Pills.vue";

const route = useRoute();
const router = useRouter();

const recipeStore = useRecipeStore();
const filterStore = useRecipeFilterStore();
const user = useSupabaseUser();
const allergyWarnings = useRecipeAllergyWarnings();
const { getRecipeImage } = useRecipeImage();
const isHydrated = ref(false);
const INITIAL_RECIPE_COUNT = 10;
const visibleRecipeCount = ref(INITIAL_RECIPE_COUNT);

onMounted(async() => {
    isHydrated.value = true;
    if (!recipeStore.getAllRecipes().length) {
    await recipeStore.loadRecipes();
  }

  if (!filterStore.mealOptions.length && !filterStore.typeOptions.length) {
    await filterStore.loadCategories();
  }

  if (!filterStore.allAllergies.length) {
    await filterStore.loadAllergies();
  }

  if (user.value) {
    await allergyWarnings.loadUserAllergies();
    await filterStore.loadUserDislikedIngredientIds();
    await filterStore.loadUserRecipeIds();
  }

  const mealName = String(route.query.meal ?? "").toLowerCase();
  const typeName = String(route.query.type ?? "").toLowerCase();
  const duration = Number(route.query.duration);

  if (!mealName && !typeName && !route.query.duration) {
    filterStore.clearFilters();
    return;
  }

  const meal = filterStore.mealOptions.find((m) => m.name.toLowerCase() === mealName);
  const type = filterStore.typeOptions.find((t) => t.name.toLowerCase() === typeName);

  filterStore.selectedMealId = meal ? meal.id : null;
  filterStore.selectedTypeId = type ? type.id : null;
  filterStore.selectedDurationId = !Number.isNaN(duration) && duration > 0 ? duration : null;

  filterStore.activeTab = "default";
});

watch(() => [filterStore.selectedMealId,filterStore.selectedTypeId, filterStore.selectedDurationId],
  () => {
    const meal = filterStore.mealOptions.find((m) => m.id === filterStore.selectedMealId);

    const type = filterStore.typeOptions.find((t) => t.id === filterStore.selectedTypeId);

    const query: Record<string, string> = {};

    if (meal) {query.meal = meal.name;}

    if (type) {query.type = type.name;}

    if (filterStore.selectedDurationId !== null) {
      query.duration = String(filterStore.selectedDurationId);
    }

    router.replace({ query });
  }
);

const activeFilterCount = computed(() => filterStore.getActiveFilterCount());

const getLocalizedPill = (recipe: any) => {
    const translatedCategories = recipe.categories.map((v: any) => {
        return {
            name: $t('categories.' + v.id),
            identifier: v.id
        }
    })
    return dataToPillTag(translatedCategories, BASIC_CONVERSION)
}

const needsLoginForTab = computed(() => {
    return !user.value && filterStore.activeTab !== "default";
});

const visibleRecipes = computed(() => {
    return filterStore.filteredRecipes.slice(0, visibleRecipeCount.value);
});

const hasMoreRecipes = computed(() => {
    return filterStore.filteredRecipes.length > visibleRecipeCount.value;
});

const loadMoreRecipes = () => {
    visibleRecipeCount.value += INITIAL_RECIPE_COUNT;
};

watch(() => filterStore.filteredRecipes, () => {
    visibleRecipeCount.value = INITIAL_RECIPE_COUNT;
});

const handleTabClick = (tab: any) => {
    filterStore.activeTab = tab;
};
</script>
<template>
    <RecipeModal />

    <section class="recipes-page">
        <div class="recipes-shell mx-auto p-5">
            <h1 class="recipes-title mb-2">{{ $t('recipe.title') }}</h1>
            <p class="recipes-subtitle mb-4">
                {{ $t('recipe.subtitle') }}
            </p>

            <div class="row align-items-center justify-content-between">
                <div class="col-lg-9 col-md-8 search-wrap my-3">
                    <SearchBar v-model="filterStore.search" :placeholder="$t('recipe.searchBar.placeholder')"
                        class="recipes-search w-100" />
                </div>

                <div class="filter-button col-lg-2 col-md-3 col-sm-6 mx-sm-auto">
                    <Button outline icon="bi bi-funnel" class="w-100 px-5 text-nowrap" data-bs-toggle="offcanvas"
                        data-bs-target="#recipeFiltersOffcanvas" aria-controls="recipeFiltersOffcanvas">
                        {{ $t('recipe.filter.title') }}
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
                            {{ $t('recipe.filter.default') }}
                        </button>
                    </li>
                    <li>
                        <button type="button" class="tab-btn" :class="{ active: filterStore.activeTab === 'own' }"
                            @click="handleTabClick('own')">
                            {{ $t('recipe.filter.own') }}
                        </button>
                    </li>
                    <li>
                        <button type="button" class="tab-btn" :class="{ active: filterStore.activeTab === 'saved' }"
                            @click="handleTabClick('saved')">
                            {{ $t('recipe.filter.liked') }}
                        </button>
                    </li>
                    <li>
                        <button type="button" class="tab-btn" :class="{ active: filterStore.activeTab === 'tried' }"
                            @click="handleTabClick('tried')">
                            {{ $t('recipe.filter.tried') }}
                        </button>
                    </li>
                    <li>
                        <button type="button" class="tab-btn" :class="{ active: filterStore.activeTab === 'ai' }"
                            @click="handleTabClick('ai')">
                            {{ $t('recipe.filter.ai') }}
                        </button>
                    </li>
                </ul>
            </nav>

            <div v-if="needsLoginForTab" class="text-center py-4">
                <p class="fw-bold">{{ $t('common.auth.notLoggedIn') }}</p>
                <Button @click="navigateTo('/login')" color="orange" class="mx-auto" icon="bi bi-box-arrow-in-right"
                    icon-position="right">
                    {{ $t('common.auth.toLogin') }}
                </Button>
            </div>

            <div v-if="!needsLoginForTab && !filterStore.filteredRecipes.length" class="text-center py-5">
                <p class="mb-0 fw-bold py-3">
                    {{ $t('recipe.filter.notFound') }}
                </p>
                <Button v-if="user" icon="bi bi-plus-lg" color="orange" class="mx-auto my-3"
                :data-bs-toggle="user ? 'modal' : null" :data-bs-target="user ? '#openAddRecipeModal' : null">
                {{ $t('recipe.filter.add') }}
                </Button>
            </div>

            <div v-if="!needsLoginForTab && filterStore.filteredRecipes.length" class="row">
                <div v-if="user" class="addRecipe col-12 col-md-6 col-lg-4 my-sm-4 d-flex justify-content-center align-items-center"
                    :data-bs-toggle="user ? 'modal' : null" :data-bs-target="user ? '#openAddRecipeModal' : null">
                    <div class="row text-center py-4">
                        <span class="plus-icon">+</span>
                        <p>{{ $t('recipe.addRecipeModal.title') }}</p>
                    </div>
                </div>
                <div v-for="recipe in visibleRecipes"
                    class="recipe-cards col-12 col-md-6 col-lg-4 my-sm-4 ">
                    <NuxtLink :to="`/recipe/${recipe.id}`" class="text-decoration-none text-reset h-100 d-block">
                        <CardBase orientation="vertical" variant="outline" media-position="top" body-class="w-100"
                            metadata-class="w-100" footer-class="w-100" class="h-100">
                            <template #media>
                                <div class="row pt-4">
                                    <div class="d-flex justify-content-center card-media">
                                        <img :src="getRecipeImage(recipe)" :alt="recipe.name" />
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
                                        {{ recipe.time }} {{ $t('recipe.card.metadata.time', recipe.time) }}
                                    </div>
                                    <div class="col-auto">
                                        <i class="bi bi-people me-1"></i>
                                        {{ recipe.servings }} {{ $t('recipe.card.metadata.people', recipe.servings) }}
                                    </div>
                                </div>

                                <div class="mb-3">
                                    <div v-if="recipe.categories?.length">
                                          <Pills :pills="getLocalizedPill(recipe)"
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
                                                <i class="bi bi-exclamation-triangle-fill p-2"></i> {{ $t('recipe.card.footer.warning') }}
                                            </strong>{{ allergyWarnings.getMatchingAllergyNames(recipe) }}
                                        </template>
                                    </div>
                                </div>
                            </template>
                        </CardBase>
                    </NuxtLink>
                </div>
            </div>

            <div v-if="!needsLoginForTab && hasMoreRecipes" class="d-flex justify-content-center mt-2 mb-4">
                <Button color="orange" @click="loadMoreRecipes">
                    További receptek
                </Button>
            </div>

            <div id="recipeFiltersOffcanvas" class="offcanvas offcanvas-end" tabindex="-1"
                aria-labelledby="recipeFiltersOffcanvasLabel">
                <div class="offcanvas-header">
                    <p id="recipeFiltersOffcanvasLabel" class="offcanvas-title fw-bold fs-5">
                        {{ $t('recipe.sidebar.title') }}
                        <span v-if="isHydrated && activeFilterCount" class="ms-2 text-muted">
                            ({{ activeFilterCount }} {{ $t('recipe.sidebar.active') }})
                        </span>
                    </p>
                    <button type="button" class="btn-close" data-bs-dismiss="offcanvas" :aria-label="$t('common.actions.close')"></button>
                </div>

                <div class="offcanvas-body">
                    <Button :outline="true" type="button" class="deleteAll grad m-auto w-75"
                        @click="filterStore.clearFilters">
                        {{ $t('recipe.sidebar.clearBtn') }}
                    </Button>
                    <div class="filters-panel offcanvas-filters">
                        <div class="filter-item">
                            <p class="filter-title">{{ $t('recipe.sidebar.time') }}</p>
                            <Pills :pills="dataToPillTag(filterStore.durationCategories as any, BASIC_CONVERSION)" interactive
                                v-model="filterStore.selectedDurationId" />
                        </div>

                        <div class="filter-item">
                            <p class="filter-title">{{ $t('recipe.sidebar.meal') }}</p>
                            <Pills :pills="dataToPillTag(filterStore.mealOptions as any, BASIC_CONVERSION)" interactive
                                v-model="filterStore.selectedMealId" />
                        </div>

                        <div class="filter-item">
                            <p class="filter-title">{{ $t('recipe.sidebar.type') }}</p>
                            <Pills :pills="dataToPillTag(filterStore.typeOptions as any, BASIC_CONVERSION)" interactive
                                v-model="filterStore.selectedTypeId" />
                        </div>
                        <div class="filter-item" v-if="user">
                            <div class="d-flex mb-2">
                                <p class="filter-title mb-0">{{ $t('recipe.sidebar.disliked.title') }}</p>
                            </div>
                            <div class="form-check mb-2">
                                <input id="ondisliked" v-model="filterStore.respectDislikedIngredients"
                                    class="form-check-input" name="isdisliked" type="radio" :value="true">
                                <label class="form-check-label" for="ondisliked">{{ $t('recipe.sidebar.disliked.counts') }}</label>
                            </div>
                            <div class="form-check">
                                <input id="offdisliked" v-model="filterStore.respectDislikedIngredients"
                                    class="form-check-input" name="isdisliked" type="radio" :value="false">
                                <label class="form-check-label" for="offdisliked">{{ $t('recipe.sidebar.disliked.not.counts') }}</label>
                            </div>
                        </div>

                        <div class="filter-item">
                            <p class="filter-title mb-3">{{ $t('recipe.sidebar.allergy.title') }}</p>
                            <FormInput v-model="filterStore.allergenSearch" :placeholder="$t('recipe.searchBar.active')" />

                            <div v-if="filterStore.selectedAllergyPills.length" class="mt-3">
                                <p class="small text-muted mb-2">{{ $t('recipe.sidebar.allergy.chosen') }}</p>
                                <Pills :pills="filterStore.selectedAllergyPills" removable @remove="filterStore.removeSelectedAllergy" />
                            </div>

                            <div v-if="filterStore.filteredAllergyPills.length" class="mt-3">
                                <p class="small text-muted mb-2">{{ $t('recipe.sidebar.allergy.available') }}</p>
                                <Pills :pills="filterStore.filteredAllergyPills" interactive @chose="filterStore.addSelectedAllergy" />
                            </div>

                            <div v-if="!filterStore.selectedAllergyPills.length && !filterStore.filteredAllergyPills.length" class="mt-3">
                                <p class="small text-muted">{{ $t('recipe.sidebar.allergy.empty') }}</p>
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

.card-media {
    height: 180px;
    overflow: hidden;
}

.card-media img {
    max-width: 80%;
    max-height: 100%;
    width: auto;
    height: auto;
    object-fit: contain;
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