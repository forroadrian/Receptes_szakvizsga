<script setup lang="ts">
import { useRecipeStore } from "~/stores/recipe";
import CategoryTags from "~/components/recipe/CategoryTags.vue";
import type Category from "~/interfaces/Category";

type RecipeTab = "default" | "own" | "saved" | "tried" | "ai";
type CategoryOption = Category;

const supabase = useSupabaseClient();
const recipeStore = useRecipeStore();
const user = useSupabaseUser();
const colorMode = useColorMode();

const search = ref("");
const allergenSearch = ref("");
const activeTab = ref<RecipeTab>("default");

const selectedDurationId = ref<number | null>(null);
const selectedMealId = ref<number | null>(null);
const selectedTypeId = ref<number | null>(null);

const mealOptions = ref<CategoryOption[]>([]);
const typeOptions = ref<CategoryOption[]>([]);

const durationOptions = [
    { id: 1, label: "15 percen belül", value: "under15" },
    { id: 2, label: "30 percen belül", value: "under30" },
    { id: 3, label: "1 órán belül", value: "under60" },
    { id: 4, label: "1 órán túl", value: "over60" }
];

const filterButtonColor = computed(() =>
    colorMode.value === "dark" ? "soft" : "dark"
);

const allRecipes = computed(() => recipeStore.getAllRecipes);

const activeDuration = computed<string | null>(() => {
    return durationOptions.find(option => option.id === selectedDurationId.value)?.value ?? null;
});

const durationCategories = computed<Category[]>(() =>
    durationOptions.map(option => ({
        id: option.id,
        name: option.label,
        group_type: null
    }))
);

const tabRecipes = computed(() => {
    if (activeTab.value === "own") {
        return allRecipes.value.filter(recipe => recipe.author_id === user.value?.id);
    }

    if (activeTab.value === "saved") {
        return [];
    }

    if (activeTab.value === "tried") {
        return [];
    }

    if (activeTab.value === "ai") {
        return [];
    }

    return allRecipes.value;
});

const hasCategory = (categories: Category[] | undefined, id: number | null) =>
    id === null || !!categories?.find(category => category.id === id);

const hasActiveFilters = computed(() =>
    search.value ||
    allergenSearch.value ||
    selectedDurationId.value !== null ||
    selectedMealId.value !== null ||
    selectedTypeId.value !== null ||
    activeTab.value !== "default"
);

const clearFilters = () => {
    search.value = "";
    allergenSearch.value = "";

    selectedDurationId.value = null;
    selectedMealId.value = null;
    selectedTypeId.value = null;

    activeTab.value = "default";
};
const filteredRecipes = computed(() =>
    tabRecipes.value.filter(recipe => {
        const query = search.value.trim().toLowerCase();
        const allergenQuery = allergenSearch.value.trim().toLowerCase();

        const matchesSearch =
            !query ||
            recipe.name.toLowerCase().includes(query) ||
            recipe.description.toLowerCase().includes(query);

        const matchesDuration =
            !activeDuration.value ||
            (activeDuration.value === "under15" && recipe.time <= 15) ||
            (activeDuration.value === "under30" && recipe.time <= 30) ||
            (activeDuration.value === "under60" && recipe.time <= 60) ||
            (activeDuration.value === "over60" && recipe.time > 60);

        const matchesMeal = hasCategory(recipe.categories, selectedMealId.value);
        const matchesType = hasCategory(recipe.categories, selectedTypeId.value);

        const matchesAllergen =
            !allergenQuery ||
            recipe.categories?.some(category =>
                category.name.toLowerCase().includes(allergenQuery)
            );

        return (
            matchesSearch &&
            matchesDuration &&
            matchesMeal &&
            matchesType &&
            matchesAllergen
        );
    })
);

const loadCategories = async () => {
    const { data, error } = await supabase
        .from("category")
        .select("id, name, group_type")
        .order("name", { ascending: true });

    if (error) {
        console.error("Hiba a kategóriák lekérése közben:", error);
        return;
    }

    const categories = (data ?? []) as CategoryOption[];

    mealOptions.value = categories.filter(
        category => String(category.group_type).toLowerCase() === "meal"
    );

    typeOptions.value = categories.filter(
        category => String(category.group_type).toLowerCase() === "type"
    );
};

onMounted(async () => {
    if (!recipeStore.getAllRecipes.length) {
        await recipeStore.loadRecipes();
    }

    await loadCategories();
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
                        <button type="button" class="tab-btn" :class="{ active: activeTab === 'default' }"
                            @click="activeTab = 'default'">
                            Alapértelmezett
                        </button>
                    </li>
                    <li>
                        <button type="button" class="tab-btn" :class="{ active: activeTab === 'own' }"
                            @click="activeTab = 'own'">
                            Saját
                        </button>
                    </li>
                    <li>
                        <button type="button" class="tab-btn" :class="{ active: activeTab === 'saved' }"
                            @click="activeTab = 'saved'">
                            Kedvelt
                        </button>
                    </li>
                    <li>
                        <button type="button" class="tab-btn" :class="{ active: activeTab === 'tried' }"
                            @click="activeTab = 'tried'">
                            Kipróbált
                        </button>
                    </li>
                    <li>
                        <button type="button" class="tab-btn" :class="{ active: activeTab === 'ai' }"
                            @click="activeTab = 'ai'">
                            AI ajánlás
                        </button>
                    </li>
                </ul>
            </nav>

            <div class="row">
                <div class="addRecipe col-12 col-md-6 col-lg-4 my-sm-4 d-flex justify-content-center align-items-center"
                    data-bs-toggle="modal" data-bs-target="#openAddRecipeModal">
                    <div class="row text-center py-4">
                        <span class="plus-icon">+</span>
                        <p>Új recept hozzáadása</p>
                    </div>
                </div>

                <div v-for="recipe in filteredRecipes" class="col-12 col-md-6 col-lg-4 my-sm-4">
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

                                <div v-if="recipe.categories?.length" class="row justify-content-center mb-3">
                                    <div class="col-12">
                                        <CategoryTags :categories="recipe.categories" />
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

            <div v-if="!filteredRecipes.length" class="text-center py-5">
                <p class="mb-0">Nincs a szűrésnek megfelelő recept.</p>
            </div>

            <div id="recipeFiltersOffcanvas" class="offcanvas offcanvas-end" tabindex="-1"
                aria-labelledby="recipeFiltersOffcanvasLabel">
                <div class="offcanvas-header">
                    <p id="recipeFiltersOffcanvasLabel" class="offcanvas-title fw-bold fs-5">Szűrők</p>
                    <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Bezárás"></button>
                </div>

                <div class="offcanvas-body">
                    <button class="deleteAll grad m-auto w-75 pt-4 ">
                        <p @click="clearFilters"> Kijelölések törlése </p>
                    </button>

                    <div class="filters-panel offcanvas-filters">
                        <div class="filter-item">
                            <p class="filter-title">Időtartam</p>
                            <CategoryTags :categories="durationCategories" interactive v-model="selectedDurationId" />
                        </div>

                        <div class="filter-item">
                            <p class="filter-title">Étkezés</p>
                            <CategoryTags :categories="mealOptions" interactive v-model="selectedMealId" />
                        </div>

                        <div class="filter-item">
                            <p class="filter-title">Típus</p>
                            <CategoryTags :categories="typeOptions" interactive v-model="selectedTypeId" />
                        </div>
                        <div class="filter-item">
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
                            <SearchBar v-model="allergenSearch" placeholder="Allergén neve / típusa..." class="w-100" />
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
    border: 2px dashed var(--bs-emphasis-color);
    border-radius: var(--radius-sm);
    cursor: pointer;
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

.filter-item {
    padding: 20px 0;
}

.filter-title {
    font-weight: 700;
}

@media (max-width: 992px) {
    .recipes-tabs ul {
        justify-content: center;
    }
}
</style>