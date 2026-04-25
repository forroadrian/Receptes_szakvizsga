import { defineStore } from "pinia";
import type Category from "~/interfaces/Category";
import type { Database } from "~/types/database.types";
import { useRecipeStore } from "~/stores/recipe";
import { useIngredientStore } from "~/stores/ingredients";
import { durationOptions, getDurationCategories, getActiveDuration } from "./duration";
import { loadRecipeFilterCategories } from "./categories";
import { getTabRecipes } from "./recipeTabs";
import { getFilteredRecipes } from "./recipeFilters";
import { createAllergyFilters } from "./allergyFilters";

type RecipeTab = "default" | "own" | "saved" | "tried" | "ai";
type CategoryOption = Category;
type AllergyRow = Database["public"]["Tables"]["allergy"]["Row"];

export const useRecipeFilterStore = defineStore("recipeFilters", () => {
    const user = useSupabaseUser();
    const recipeStore = useRecipeStore();
    const ingredientStore = useIngredientStore();

    const search = ref("");
    const allergenSearch = ref("");
    const activeTab = ref<RecipeTab>("default");
    const selectedDurationId = ref<number | null>(null);
    const selectedMealId = ref<number | null>(null);
    const selectedTypeId = ref<number | null>(null);
    const mealOptions = ref<CategoryOption[]>([]);
    const typeOptions = ref<CategoryOption[]>([]);
    const userDislikedIngredientIds = ref<number[]>([]);
    const allAllergies = ref<AllergyRow[]>([]);
    const selectedAllergyIds = ref<number[]>([]);
    const savedRecipeIds = ref<number[]>([]);
    const triedRecipeIds = ref<number[]>([]);
    const userRecipeLoaded = ref(false);
    const respectDislikedIngredients = useLocalStorage<boolean>("respectDislikedIngredients", true);

    const aiRecommendedRecipes = ref<{ id: number; reason: string }[]>([]);
    const aiLoading = ref(false);
    const aiLoaded = ref(false);

    const durationCategories = computed(() => getDurationCategories());
    const activeDuration = computed(() => getActiveDuration(selectedDurationId.value));

    const { selectedAllergyPills, filteredAllergyPills, loadAllergies } = createAllergyFilters(
        allAllergies, selectedAllergyIds, allergenSearch
    );

    const shouldRespectDislikedIngredients = computed(() => !!user.value && respectDislikedIngredients.value);

    const aiRecommendedIds = computed(() => aiRecommendedRecipes.value.map(r => r.id));

    const tabRecipes = computed(() =>
        getTabRecipes(recipeStore.getAllRecipes(), activeTab.value, user.value?.id ?? user.value?.sub, savedRecipeIds.value, triedRecipeIds.value, aiRecommendedIds.value)
    );

    const filteredRecipes = computed(() =>
        getFilteredRecipes(
            tabRecipes.value, search.value,
            activeDuration.value, selectedMealId.value, selectedTypeId.value,
            shouldRespectDislikedIngredients.value,
            userDislikedIngredientIds.value,
            selectedAllergyIds.value
        )
    );

    const hasActiveFilters = computed(() =>
        search.value !== "" ||
        selectedDurationId.value !== null || selectedMealId.value !== null ||
        selectedTypeId.value !== null || activeTab.value !== "default" ||
        shouldRespectDislikedIngredients.value || selectedAllergyIds.value.length > 0
    );

    const clearFilters = () => {
        search.value = "";
        allergenSearch.value = "";
        selectedAllergyIds.value = [];
        selectedDurationId.value = null;
        selectedMealId.value = null;
        selectedTypeId.value = null;
        activeTab.value = "default";
    };

    const loadCategories = async () => {
        await loadRecipeFilterCategories(mealOptions, typeOptions);
    };

    const loadUserDislikedIngredientIds = async () => {
        if (!user.value) { userDislikedIngredientIds.value = []; return; }
        try {
            const data = await $fetch<{ ingredient_id: number }[]>("/api/preferences/user-dislike", {
                method: "GET"
            });
            userDislikedIngredientIds.value = (data || []).map((item) => item.ingredient_id);
        } catch (error) {
            userDislikedIngredientIds.value = [];
            console.error("Nem sikerült betölteni a nem kedvelt alapanyagokat.", error);
        }
    };

    const loadUserRecipeIds = async () => {
        if (process.server || !user.value || userRecipeLoaded.value) return;
        try {
            const [saved, tried] = await Promise.all([
                $fetch<number[]>("/api/recipe/saved", { method: "GET" }),
                $fetch<number[]>("/api/recipe/tried", { method: "GET" })
            ]);
            savedRecipeIds.value = saved;
            triedRecipeIds.value = tried;
            userRecipeLoaded.value = true;
        } catch (error) {
            console.error("Nem sikerült betölteni a recept állapotokat.", error);
        }
    };

    const toggleSaved = async (recipeId: number) => {
        try {
            const { saved } = await $fetch<{ saved: boolean }>("/api/recipe/saved", {
                method: "POST",
                body: { recipe_id: recipeId }
            });
            savedRecipeIds.value = saved
                ? [...savedRecipeIds.value, recipeId]
                : savedRecipeIds.value.filter((id) => id !== recipeId);
        } catch (error) {
            console.error("Nem sikerült menteni a receptet.", error);
        }
    };

    const toggleTried = async (recipeId: number) => {
        try {
            const { tried } = await $fetch<{ tried: boolean }>("/api/recipe/tried", {
                method: "POST",
                body: { recipe_id: recipeId }
            });
            triedRecipeIds.value = tried
                ? [...triedRecipeIds.value, recipeId]
                : triedRecipeIds.value.filter((id) => id !== recipeId);
        } catch (error) {
            console.error("Nem sikerült menteni a kipróbált státuszt.", error);
        }
    };

    const aiError = ref<'rate_limit' | 'generic' | null>(null);

    const loadAiRecommendations = async (params: { language: string; userAllergyIds: number[]; force?: boolean }) => {
        if (aiLoading.value) return;
        if (aiLoaded.value && !params.force) return;
        aiLoading.value = true;
        aiError.value = null;

        const allRecipes = recipeStore.getAllRecipes();
        const pantry = ingredientStore.ingredients.map(i => ({ name: i.name, quantity: i.quantity, unit: i.unit }));

        const pantryNames = new Set(pantry.map(p => p.name.toLowerCase()));

        const scored = allRecipes
            .map(r => ({
                recipe: r,
                score: r.ingredients.filter((i: any) => pantryNames.has(i.name.toLowerCase())).length
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 40);

        const recipePayload = scored.map(({ recipe }) => ({
            id: recipe.id,
            name: recipe.name,
            ingredientNames: recipe.ingredients.map((i: any) => i.name),
            categoryNames: recipe.categories.map((c: any) => c.name)
        }));

        const userAllergyNames = allAllergies.value
            .filter(a => params.userAllergyIds.includes(a.id))
            .map(a => a.name);

        const dislikedIngredientNames = ingredientStore.availableIngredients
            .filter(i => userDislikedIngredientIds.value.includes(i.id))
            .map(i => i.name);

        try {
            const result = await $fetch<{ id: number; reason: string }[]>('/api/recipe/ai-recommendations', {
                method: 'POST',
                body: {
                    language: params.language,
                    pantry,
                    recipes: recipePayload,
                    userAllergyNames,
                    dislikedIngredientNames
                }
            });
            aiRecommendedRecipes.value = result ?? [];
            aiLoaded.value = true;
        } catch (err: any) {
            console.error('AI recommendations failed:', err);
            aiRecommendedRecipes.value = [];
            aiLoaded.value = true;
            const status = err?.response?.status ?? err?.statusCode ?? err?.data?.statusCode;
            aiError.value = status === 429 ? 'rate_limit' : 'generic';
        } finally {
            aiLoading.value = false;
        }
    };

    const getAiReason = (recipeId: number): string => {
        return aiRecommendedRecipes.value.find(r => r.id === recipeId)?.reason ?? '';
    };

    const removeSelectedAllergy = (allergyId: number) => {
        selectedAllergyIds.value = selectedAllergyIds.value.filter((id) => id !== allergyId);
    };

    const addSelectedAllergy = (allergyId: number) => {
        if (!selectedAllergyIds.value.includes(allergyId)) selectedAllergyIds.value.push(allergyId);
    };

    const getActiveFilterCount = () =>
        (selectedDurationId.value !== null ? 1 : 0) +
        (selectedMealId.value !== null ? 1 : 0) +
        (selectedTypeId.value !== null ? 1 : 0) +
        selectedAllergyIds.value.length +
        (shouldRespectDislikedIngredients.value ? 1 : 0);

    watch(user, (newUser) => {
        if (!newUser) {
            userDislikedIngredientIds.value = [];
            savedRecipeIds.value = [];
            triedRecipeIds.value = [];
            userRecipeLoaded.value = false;
        }
    });

    return {
        search, allergenSearch, getActiveFilterCount, activeTab,
        selectedDurationId, selectedMealId, selectedTypeId,
        mealOptions, typeOptions, durationOptions, durationCategories, activeDuration,
        tabRecipes, filteredRecipes, hasActiveFilters, clearFilters, loadCategories,
        respectDislikedIngredients, userDislikedIngredientIds, loadUserDislikedIngredientIds,
        allAllergies, selectedAllergyIds, selectedAllergyPills, filteredAllergyPills, loadAllergies,
        removeSelectedAllergy, addSelectedAllergy,
        savedRecipeIds, triedRecipeIds,
        loadUserRecipeIds, toggleSaved, toggleTried,
        aiRecommendedRecipes, aiLoading, aiLoaded, aiError,
        loadAiRecommendations, getAiReason
    };
});