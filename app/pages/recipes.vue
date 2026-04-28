<script setup lang="ts">
import { computed, onMounted } from "vue";
import Button from "~/components/Button.vue";
import FormInput from "~/components/FormInput.vue";
import { useRecipeStore } from "~/stores/recipe";
import { useRecipeFilterStore } from "~/stores/recipeFilters";
import { useRecipeModal } from "~/composables/useRecipeModal";
import { useIngredientStore } from "~/stores/ingredients";
import Pills from "~/components/Pills.vue";
import type Pill from "~/interfaces/Pill";

const route = useRoute();
const router = useRouter();
const { locale, t } = useI18n();
const { formatIngredient } = useIngredientFormatter();
const { formatCategory } = useCategoryFormatter();

const recipeStore = useRecipeStore();
const filterStore = useRecipeFilterStore();
const recipeModal = useRecipeModal();
const ingredientStore = useIngredientStore();
const user = useSupabaseUser();
const allergyWarnings = useRecipeAllergyWarnings();
const { getRecipeImage } = useRecipeImage();
const isHydrated = ref(false);
const INITIAL_RECIPE_COUNT = 10;
const visibleRecipeCount = ref(INITIAL_RECIPE_COUNT);

const searchMode = ref<'name' | 'ingredient'>('name');
const selectedIngredientIds = ref<number[]>([]);
const ingredientSearchText = ref('');

const ingredientPills = computed(() => {
    if (!ingredientSearchText.value) return [];
    const all = ingredientStore.availableIngredients ?? [];
    const selected = selectedIngredientIds.value;
    const filtered = all.filter((ing: any) =>
            ing.name.toLowerCase().includes(ingredientSearchText.value.toLowerCase())
            && !selected.includes(ing.id)).slice(0, 10);
    return filtered.map((ing: any) => ({
        name: formatIngredient(ing.id),
        identifier: ing.id
    }));
});

const selectedIngredientPills = computed(() => {
    const all = ingredientStore.availableIngredients ?? [];
    return selectedIngredientIds.value
        .map((id: number) => {
            const ing = all.find((i: any) => i.id === id);
            if (!ing) return null;
            return { name: formatIngredient(ing.id), identifier: ing.id };
        })
        .filter(Boolean) as { name: string; identifier: number }[];
});

const recipesFilteredByIngredients = computed(() => {
    const base = filterStore.filteredRecipes;
    if (searchMode.value !== 'ingredient' || selectedIngredientIds.value.length === 0) {
        return base;
    }

    const selectedNames = selectedIngredientIds.value.map((id: number) => {
        const ing = (ingredientStore.availableIngredients ?? []).find((i: any) => i.id === id);
        return ing ? ing.name.toLowerCase() : '';
    }).filter(Boolean);

    return base.filter((recipe: any) => {
        const recipeIngredientNames = (recipe.ingredients ?? []).map((i: any) =>
            (i.name ?? i._name ?? '').toLowerCase()
        );
        return selectedNames.some((name: string) =>
            recipeIngredientNames.some((rName: string) => rName.includes(name))
        );
    });
});

const removeSelectedIngredient = (id: number) => {
    selectedIngredientIds.value = selectedIngredientIds.value.filter((i: number) => i !== id);
};

watch(searchMode, (newMode) => {
    if (newMode === 'name') {
        selectedIngredientIds.value = [];
        ingredientSearchText.value = '';
    } else {
        filterStore.search = '';
    }
    visibleRecipeCount.value = INITIAL_RECIPE_COUNT;
});

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
            name: formatCategory(v.id),
            identifier: v.id
        }
    })
    return dataToPillTag(translatedCategories, BASIC_CONVERSION)
}

const needsLoginForTab = computed(() => {
    return !user.value && filterStore.activeTab !== "default";
});

const visibleRecipes = computed(() => {
    return recipesFilteredByIngredients.value.slice(0, visibleRecipeCount.value);
});

const hasMoreRecipes = computed(() => {
    return recipesFilteredByIngredients.value.length > visibleRecipeCount.value;
});

const loadMoreRecipes = () => {
    visibleRecipeCount.value += INITIAL_RECIPE_COUNT;
};

watch(() => recipesFilteredByIngredients.value, () => {
    visibleRecipeCount.value = INITIAL_RECIPE_COUNT;
});

const handleTabClick = (tab: any) => {
    filterStore.activeTab = tab;
};

const handleAddRecipeClick = () => {
    recipeModal.resetForm();
};

const triggerAiRecommendations = (force = false) => {
    filterStore.loadAiRecommendations({
        language: locale.value,
        userAllergyIds: allergyWarnings.userAllergyIds.value,
        force
    });
};

const getAiPill = (recipe: any) => {
    if (!recipe.categories?.length) return [];
    return dataToPillTag(
        recipe.categories.map((v: any) => ({ name: v.name, identifier: v.id })),
        BASIC_CONVERSION
    );
};

const openAiRecipeForm = async (recipe: any) => {
    if (!user.value) {
        navigateTo('/login');
        return;
    }

    await recipeModal.init();
    recipeModal.resetForm();

    const categories = recipeStore.getAvailableCategories();
    const mealTypes = categories.filter(c => c.group_type === 'meal');
    const typeTags = categories.filter(c => c.group_type === 'type');

    const mealMatch = mealTypes.find(
        m => m.name.toLowerCase() === recipe.mealType?.toLowerCase()
    );
    const tagMatches = typeTags
        .filter(t => recipe.tags?.some(
            (tag: string) => tag.toLowerCase() === t.name.toLowerCase()
        ))
        .map(t => t.id);

    const available = ingredientStore.availableIngredients;
    const matchedIngredients = (recipe.ingredients ?? [])
        .map((ing: any) => {
            const match = available.find(
                a => a.name.toLowerCase() === ing.name.toLowerCase()
            );
            if (!match) return null;
            return {
                ingredient_id: match.id,
                name: match.name,
                quantity: ing.quantity,
                unit: ing.unit
            };
        })
        .filter(Boolean);

    recipeModal.recipe.name = recipe.name ?? '';
    recipeModal.recipe.description = recipe.description ?? '';
    recipeModal.recipe.prepTime = recipe.prepTime ?? 60;
    recipeModal.recipe.servings = recipe.servings ?? 4;
    recipeModal.recipe.mealType = mealMatch?.id ?? null;
    recipeModal.recipe.tags = tagMatches;
    recipeModal.recipe.ingredients = matchedIngredients;
    recipeModal.recipe.instructions = recipe.instructions ?? [];

    if (import.meta.client) {
        const modalEl = document.getElementById('openAddRecipeModal');
        if (modalEl) (window as any).bootstrap.Modal.getOrCreateInstance(modalEl).show();
    }
};

watch(() => filterStore.activeTab, async (tab) => {
    if (tab !== 'ai') return;
    if (!recipeStore.getAllRecipes().length) {
        await recipeStore.loadRecipes();
    }
    triggerAiRecommendations();
});

// If filters change while on the AI tab, refresh the recommendations
watch(() => [
    filterStore.selectedMealId,
    filterStore.selectedTypeId,
    filterStore.selectedDurationId,
    filterStore.selectedAllergyIds,
    filterStore.search
], () => {
    if (filterStore.activeTab === 'ai') {
        triggerAiRecommendations(true);
    }
});

// If language changes while on the AI tab, translate existing recipes instead of regenerating
watch(locale, () => {
    if (filterStore.activeTab === 'ai' && filterStore.aiRecommendedRecipes.length) {
        filterStore.translateAiRecipes(locale.value);
    }
});

const tabCounts = computed(() => {
    const all = recipeStore.getAllRecipes();
    const userId = user.value?.id ?? user.value?.sub;
    return {
        default: all.filter(r => r.author_id === null || r.public === true).length,
        own: all.filter(r => r.author_id === userId).length,
        saved: filterStore.savedRecipeIds.length,
        tried: filterStore.triedRecipeIds.length
    };
});

</script>
<template>
    <RecipeModal />

    <section class="recipes-page">
        <div class="recipes-shell mx-auto p-5">
            <h1 class="recipes-title mb-2">{{ $t('recipe.title') }}</h1>
            <p class="recipes-subtitle mb-4">
                {{ $t('recipe.subtitle') }}
            </p>

            <div class="row align-items-end justify-content-between">
                <div class="col-lg-9 col-md-8 search-wrap my-3">
                    <div class="search-mode-toggle d-flex gap-2 mb-3">
                        <div class="search-mode-btn" :class="{ active: searchMode === 'name' }" @click="searchMode = 'name'">
                            <i class="bi bi-fonts me-1"></i>
                            {{ $t('recipe.searchBar.byName') }}
                        </div>
                        <div class="search-mode-btn" :class="{ active: searchMode === 'ingredient' }" @click="searchMode = 'ingredient'">
                            <i class="bi bi-egg me-1"></i>
                            {{ $t('recipe.searchBar.byIngredient') }}
                        </div>
                    </div>
                        <SearchBar  v-if="searchMode === 'name'" v-model="filterStore.search"
                        :placeholder="$t('recipe.searchBar.placeholder')"  class="recipes-search w-100" />
                    
                    <div v-if="searchMode === 'ingredient'">
                        <SearchBar v-model="ingredientSearchText" :placeholder="$t('recipe.searchBar.ingredientPlaceholder')"  class="recipes-search w-100"/>
                    </div>
                </div>
                <div class="filter-button col-lg-3 col-md-4 col-sm-6 mx-sm-auto">
                    <Button outline icon="bi bi-funnel" class="w-100 px-5 text-nowrap mb-3" data-bs-toggle="offcanvas"
                        data-bs-target="#recipeFiltersOffcanvas" aria-controls="recipeFiltersOffcanvas">
                        {{ $t('recipe.filter.title') }}
                        <span v-if="isHydrated && activeFilterCount" class="filter-count d-inline-flex me-3">
                            {{ activeFilterCount }}
                        </span>
                    </Button>
                </div>
                <div v-if="searchMode === 'ingredient'">
                          <div v-if="selectedIngredientPills.length" class="mt-3">
                            <p class="small text-muted mb-1">{{ $t('recipe.searchBar.selectedIngredients') }}</p>
                            <Pills :pills="selectedIngredientPills" all-active removable icon="bi-x-circle" @remove="removeSelectedIngredient"/>
                        </div>

                        <div v-if="ingredientPills.length" class="mt-2 ingredient-pills-container">
                            <p class="small text-muted mb-1">{{ $t('recipe.searchBar.availableIngredients')  }}</p>
                            <Pills :pills="ingredientPills" interactive multi v-model="selectedIngredientIds" icon="bi-plus-circle"/>
                        </div>
                    </div>
                </div>

            <nav class="recipes-tabs mt-3">
                <ul class="row list-unstyled g-3 g-md-0 justify-content-lg-evenly pt-3">
                    <li class="col-12 col-sm-6 col-md-4 col-lg-auto pb-md-3">
                        <Button type="button" class="tab-btn" icon="bi bi-three-dots" :class="{ active: filterStore.activeTab === 'default' }"
                            @click="handleTabClick('default')">
                            {{ $t('recipe.filter.default') }} {{ tabCounts.default ? `(${tabCounts.default})` : '' }}
                        </Button>
                    </li>

                    <li class="col-12 col-sm-6 col-md-4 col-lg-auto pb-md-3">
                        <Button type="button" class="tab-btn" icon="bi bi-person" :class="{ active: filterStore.activeTab === 'own' }"
                            @click="handleTabClick('own')">
                            {{ $t('recipe.filter.own') }} {{ tabCounts.own ? `(${tabCounts.own})` : '' }}
                        </Button>
                    </li>

                    <li class="col-12 col-sm-6 col-md-4 col-lg-auto pb-md-3">
                        <Button type="button" class="tab-btn" icon="bi bi-star" :class="{ active: filterStore.activeTab === 'saved' }"
                            @click="handleTabClick('saved')">
                            {{ $t('recipe.filter.liked') }} {{ tabCounts.saved ? `(${tabCounts.saved})` : '' }}
                        </Button>
                    </li>

                    <li class="col-12 col-sm-6 col-md-4 col-lg-auto pb-md-3">
                        <Button type="button" class="tab-btn" icon="bi bi-check-circle" :class="{ active: filterStore.activeTab === 'tried' }"
                            @click="handleTabClick('tried')">
                            {{ $t('recipe.filter.tried') }} {{ tabCounts.tried ? `(${tabCounts.tried})` : '' }}
                        </Button>
                    </li>

                    <li class="col-12 col-sm-6 col-md-4 col-lg-auto pb-md-3" >
                        <Button type="button" class="tab-btn" icon="bi bi-stars" :class="{ active: filterStore.activeTab === 'ai' }" 
                            @click="handleTabClick('ai')"> {{ $t('recipe.filter.ai') }}
                        </Button>
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

            <div v-if="!needsLoginForTab && filterStore.activeTab === 'ai' && filterStore.aiLoading" class="ai-loading-state text-center py-5">
                <div class="ai-loading-spinner mb-3">
                    <i class="bi bi-stars ai-loading-icon"></i>
                </div>
                <p class="fw-semibold mb-1">{{ $t('recipe.aiRecommendations.loading') }}</p>
                <p class="text-muted small">{{ $t('recipe.aiRecommendations.loadingSubtitle') }}</p>
            </div>

            <div v-if="!needsLoginForTab && filterStore.activeTab === 'ai' && filterStore.aiLoaded && !filterStore.aiLoading" class="d-flex justify-content-end mb-3">
                <button class="ai-refresh-btn" @click="triggerAiRecommendations(true)">
                    <i class="bi bi-arrow-clockwise me-1"></i>{{ $t('recipe.aiRecommendations.refresh') }}
                </button>
            </div>

            <div v-if="!needsLoginForTab && !recipesFilteredByIngredients.length && !(filterStore.activeTab === 'ai' && filterStore.aiLoading)" class="text-center py-5">
                <p class="mb-0 fw-bold py-3">
                    <template v-if="filterStore.activeTab === 'ai' && filterStore.aiLoaded">
                        <i v-if="filterStore.aiError === 'rate_limit'" class="bi bi-clock me-1"></i>
                        <i v-else class="bi bi-exclamation-circle me-1"></i>
                        {{ filterStore.aiError === 'rate_limit'
                            ? $t('recipe.aiRecommendations.rateLimit')
                            : $t('recipe.aiRecommendations.noResults') }}
                    </template>
                    <template v-else>{{ $t('recipe.filter.notFound') }}</template>
                </p>
                <Button v-if="user && filterStore.activeTab !== 'ai'" icon="bi bi-plus-lg" color="orange" class="mx-auto my-3"
                :data-bs-toggle="user ? 'modal' : null" :data-bs-target="user ? '#openAddRecipeModal' : null"
                @click="handleAddRecipeClick">
                {{ $t('recipe.filter.add') }}
                </Button>
                <button v-if="filterStore.activeTab === 'ai' && filterStore.aiLoaded" class="ai-refresh-btn mt-2" @click="triggerAiRecommendations(true)">
                    <i class="bi bi-arrow-clockwise me-1"></i>{{ $t('recipe.aiRecommendations.refresh') }}
                </button>
            </div>

            <div v-if="!needsLoginForTab && recipesFilteredByIngredients.length" class="row">
                <div v-if="user && filterStore.activeTab !== 'ai'" class="addRecipe col-12 col-md-6 col-lg-4 my-sm-3 d-flex justify-content-center align-items-center"
                    :data-bs-toggle="user ? 'modal' : null" :data-bs-target="user ? '#openAddRecipeModal' : null"
                    @click="handleAddRecipeClick">
                    <div class="row text-center py-3">
                        <span class="plus-icon">+</span>
                        <p>{{ $t('recipe.addRecipeModal.title') }}</p>
                    </div>
                </div>
                <div v-for="recipe in visibleRecipes"
                    class="recipe-cards col-12 col-md-6 col-lg-4 my-3">
                    <NuxtLink v-if="!recipe.isAi" :to="`/recipe/${recipe.id}`" class="text-decoration-none text-reset h-100 d-block">
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
                                        <p class="text-center mb-3 small">{{ recipe.description }}</p>
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
                                        <Pills :pills="getLocalizedPill(recipe)" class="d-flex justify-content-center" />
                                    </div>
                                </div>
                            </template>

                            <template #footer>
                                <div class="row pt-2">
                                    <div class="col-12 text-center small my-auto text-danger">
                                        <template v-if="isHydrated && user && allergyWarnings.hasAllergyWarning(recipe)">
                                            <strong>
                                                <i class="bi bi-exclamation-triangle-fill p-2"></i> {{ $t('recipe.card.footer.warning') }}
                                            </strong>{{ allergyWarnings.getMatchingAllergyNames(recipe) }}
                                        </template>
                                    </div>
                                </div>
                            </template>
                        </CardBase>
                    </NuxtLink>

                    <div v-else class="ai-recipe-wrapper text-decoration-none text-reset h-100 d-block">
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
                                <CardHeader class="w-100 card-header my-4 pt-5">
                                    <CardTitle :rank="5">{{ recipe.name }}</CardTitle>
                                    <template #actions>
                                        <span title="AI" class="top-0 start-50 translate-middle ai-badge-icon"><i class="bi bi-stars"></i></span>
                                    </template>
                                </CardHeader>
                            </template>

                            <template #body>
                                <div class="row justify-content-center">
                                    <div class="col-10 col-lg-8">
                                        <p class="text-center mb-3 small">{{ recipe.description }}</p>
                                        <div v-if="recipe.reason" class="ai-reason-badge">
                                            <i class="bi bi-stars me-1"></i>
                                            <span>{{ recipe.reason }}</span>
                                        </div>
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
                                        <Pills :pills="getAiPill(recipe)" class="d-flex justify-content-center" />
                                    </div>
                                </div>
                            </template>

                            <template #footer>
                                <div class="row pt-2">
                                    <div class="col-12 text-center">
                                        <Button color="orange" icon="bi bi-bookmark-plus" class="mx-auto" @click="openAiRecipeForm(recipe)">
                                            {{ $t('recipe.aiRecommendations.saveAsRecipe') }}
                                        </Button>
                                    </div>
                                </div>
                            </template>
                        </CardBase>
                    </div>
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

.search-mode-toggle {
    border: 1.5px solid var(--bs-border-color);
    border-radius: var(--radius-sm);
    overflow: hidden;
    width: fit-content;
}

.search-mode-btn {
    background: var(--bs-body-bg);
    color: var(--bs-secondary-color);
    padding: 10px ;
    font-size: var(--small-text);
}

.search-mode-btn.active, .search-mode-btn.active {
    background: var(--bs-emphasis-color);
    color: var(--bs-body-bg);
}

.card-media {
    height: 180px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.card-media img {
    width: 100%;
    height: 100%;
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
    margin: auto;
    padding: 0px;
}

.addRecipe,
.tab-btn,
.offcanvas-filters .form-check-label,
.offcanvas-filters .form-check-input[type="radio"], .search-mode-btn  {
    cursor: pointer;
}

.tab-btn:hover,
.tab-btn.active {
    color: var(--dark);
}

.tab-btn::after{
    animation: none!important;
}

.tab-btn.active {
    border-bottom: 2px solid var(--bs-emphasis-color);
    border-radius: 0;
    font-weight: 500;
}

.filter-item {
    padding: 20px 0;
}

.filter-title,
.filter-count, .search-mode-btn.active {
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

/* AI Recommendations */
.ai-loading-state {
    padding: 3rem 0;
}

.ai-loading-icon {
    font-size: 2.5rem;
    color: var(--bs-emphasis-color);
    animation: ai-pulse 1.5s ease-in-out infinite;
}

@keyframes ai-pulse {
    0%, 100% { opacity: 0.4; transform: scale(0.9); }
    50% { opacity: 1; transform: scale(1.1); }
}

.ai-refresh-btn {
    background: var(--bs-secondary-bg);
    border: 1px solid var(--bs-border-color);
    border-radius: 999px;
    padding: 0.35rem 1rem;
    font-size: 0.82rem;
    font-weight: 500;
    cursor: pointer;
    color: var(--bs-body-color);
    transition: background 0.15s, box-shadow 0.15s;
}

.ai-refresh-btn:hover {
    background: var(--bs-tertiary-bg, #e9ecef);
    box-shadow: 0 1px 4px rgba(0,0,0,0.08);
}

.ai-reason-badge {
    display: flex;
    align-items: flex-start;
    gap: 0.25rem;
    background: var(--bs-secondary-bg);
    border: 1px solid var(--bs-border-color);
    border-radius: 0.5rem;
    padding: 0.4rem 0.65rem;
    font-size: 0.78rem;
    color: var(--bs-secondary-color);
    margin-top: 0.25rem;
    margin-bottom: 0.5rem;
    line-height: 1.4;
}

.ai-reason-badge i {
    flex-shrink: 0;
    margin-top: 0.1rem;
}

.ai-recipe-wrapper {
    cursor: default;
}

.ai-badge-icon {
    color: var(--orange);
    font-size: 1.1rem;
}

/* AI Filters Info Banner */
.ai-filters-banner {
    background: var(--bs-secondary-bg);
    border: 1px solid var(--bs-border-color);
    border-left: 3px solid var(--orange);
    border-radius: 0.5rem;
    padding: 0.7rem 1rem;
    font-size: 0.85rem;
}

.ai-filters-banner-icon {
    color: var(--orange);
    font-size: 1rem;
}

.ai-filters-banner-text {
    color: var(--bs-body-color);
    font-weight: 500;
    line-height: 1.4;
}

.ai-filters-no-filter {
    color: var(--bs-secondary-color);
    font-size: 0.8rem;
}

.ai-active-filter-badge {
    display: inline-flex;
    align-items: center;
    background: var(--bs-tertiary-bg, #f1f3f5);
    border: 1px solid var(--bs-border-color);
    border-radius: 999px;
    padding: 0.15rem 0.6rem;
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--bs-body-color);
}



/* Banner transition */
.ai-banner-enter-active,
.ai-banner-leave-active {
    transition: opacity 0.2s ease, transform 0.2s ease;
}

.ai-banner-enter-from,
.ai-banner-leave-to {
    opacity: 0;
    transform: translateY(-6px);
}
</style>