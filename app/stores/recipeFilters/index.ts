import { defineStore } from "pinia";
import type Category from "~/interfaces/Category";
import { useRecipeStore } from "~/stores/recipe";
import { durationOptions, getDurationCategories, getActiveDuration } from "./duration";
import { loadRecipeFilterCategories } from "./categories";
import { getTabRecipes } from "./recipeTabs";
import { getFilteredRecipes } from "./recipeFilters";

type RecipeTab = "default" | "own" | "saved" | "tried" | "ai";
type CategoryOption = Category;

export const useRecipeFilterStore = defineStore("recipeFilters", () => {
    const user = useSupabaseUser();
    const recipeStore = useRecipeStore();

    const search = ref("");
    const allergenSearch = ref("");
    const activeTab = ref<RecipeTab>("default");
    const selectedDurationId = ref<number | null>(null);
    const selectedMealId = ref<number | null>(null);
    const selectedTypeId = ref<number | null>(null);
    const mealOptions = ref<CategoryOption[]>([]);
    const typeOptions = ref<CategoryOption[]>([]);
    const respectDislikedIngredients = ref(true);
    const userDislikedIngredientIds = ref<number[]>([]);

    const durationCategories = computed(() => getDurationCategories());
    const activeDuration = computed(() => getActiveDuration(selectedDurationId.value));

    const tabRecipes = computed(() => {
        return getTabRecipes(recipeStore.getAllRecipes(), activeTab.value, user.value?.id);
    });

    const filteredRecipes = computed(() => {
        return getFilteredRecipes(
            tabRecipes.value, search.value, allergenSearch.value,
            activeDuration.value, selectedMealId.value, selectedTypeId.value, respectDislikedIngredients.value,
            userDislikedIngredientIds.value
        );
    });

    const hasActiveFilters = computed(() => {
        return search.value !== "" || allergenSearch.value !== "" ||
            selectedDurationId.value !== null || selectedMealId.value !== null ||
            selectedTypeId.value !== null || activeTab.value !== "default" || respectDislikedIngredients.value;
    });

    const clearFilters = () => {
        search.value = "";
        allergenSearch.value = "";
        selectedDurationId.value = null;
        selectedMealId.value = null;
        selectedTypeId.value = null;
        activeTab.value = "default";
        respectDislikedIngredients.value = true;
    };

    const loadCategories = async () => {
        await loadRecipeFilterCategories(mealOptions, typeOptions);
    };

    const loadUserDislikedIngredientIds = async () => {
        if (!user.value) {
            userDislikedIngredientIds.value = [];
            return;
        }

        try {
            const data = await $fetch<{ ingredient_id: number }[]>("/api/preferences/user-dislike", {
                method: "GET"
            });

            userDislikedIngredientIds.value = (data || []).map(item => item.ingredient_id);
        } catch (error) {
            userDislikedIngredientIds.value = [];
            console.error("Nem sikerült betölteni a nem kedvelt alapanyagokat.", error);
        }
    };

    const getActiveFilterCount = () => {
        return ((selectedDurationId.value !== null ? 1 : 0) +
            (selectedMealId.value !== null ? 1 : 0) +
            (selectedTypeId.value !== null ? 1 : 0) +
            (allergenSearch.value.trim() ? 1 : 0) +
            (respectDislikedIngredients.value ? 1 : 0));
    };

    return {
        search, allergenSearch, getActiveFilterCount, activeTab, selectedDurationId,
        selectedMealId, selectedTypeId, mealOptions, typeOptions, durationOptions,
        durationCategories, activeDuration, tabRecipes, filteredRecipes,
        hasActiveFilters, clearFilters, loadCategories,  respectDislikedIngredients,
        userDislikedIngredientIds, loadUserDislikedIngredientIds
    };
});