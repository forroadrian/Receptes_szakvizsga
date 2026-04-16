import { defineStore } from "pinia";
import type Category from "~/interfaces/Category";
import type { Database } from "~/types/database.types";
import { useRecipeStore } from "~/stores/recipe";
import { durationOptions, getDurationCategories, getActiveDuration } from "./duration";
import { loadRecipeFilterCategories } from "./categories";
import { getTabRecipes } from "./recipeTabs";
import { getFilteredRecipes } from "./recipeFilters";
import { createAllergyFilters } from "./allergyFilters";

type RecipeTab = "default" | "own" | "saved" | "tried" | "ai";
type CategoryOption = Category;
type AllergyRow = Database['public']['Tables']['allergy']['Row'];
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
    const userDislikedIngredientIds = ref<number[]>([]);
    const allAllergies = ref<AllergyRow[]>([]);
    const selectedAllergyIds = ref<number[]>([]);
    const respectDislikedIngredients = useLocalStorage<boolean>("respectDislikedIngredients", true);

    const durationCategories = computed(() => getDurationCategories());
    const activeDuration = computed(() => getActiveDuration(selectedDurationId.value));

    const { selectedAllergyPills, filteredAllergyPills, loadAllergies } = createAllergyFilters(
        allAllergies,
        selectedAllergyIds,
        allergenSearch
    );

    const shouldRespectDislikedIngredients = computed(() => {
        return !!user.value && respectDislikedIngredients.value;
    });

    const tabRecipes = computed(() => {
        return getTabRecipes(recipeStore.getAllRecipes(), activeTab.value, user.value?.id);
    });

    const filteredRecipes = computed(() => {
        return getFilteredRecipes(
            tabRecipes.value, search.value,
            activeDuration.value, selectedMealId.value, selectedTypeId.value,
            shouldRespectDislikedIngredients.value,
            userDislikedIngredientIds.value,
            selectedAllergyIds.value
        );
    });

    const hasActiveFilters = computed(() => {
        return search.value !== "" ||
            selectedDurationId.value !== null || selectedMealId.value !== null ||
            selectedTypeId.value !== null || activeTab.value !== "default" ||
            shouldRespectDislikedIngredients.value || selectedAllergyIds.value.length > 0;
    });

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

    const removeSelectedAllergy = (allergyId: number) => {
        selectedAllergyIds.value = selectedAllergyIds.value.filter(id => id !== allergyId);
    };

    const addSelectedAllergy = (allergyId: number) => {
        if (!selectedAllergyIds.value.includes(allergyId)) {
            selectedAllergyIds.value.push(allergyId);
        }
    };

    const getActiveFilterCount = () => {
        return ((selectedDurationId.value !== null ? 1 : 0) +
            (selectedMealId.value !== null ? 1 : 0) +
            (selectedTypeId.value !== null ? 1 : 0) +
            (allergenSearch.value.trim() ? 1 : 0) +
            (shouldRespectDislikedIngredients.value ? 1 : 0));
    };

    watch(user, (newUser) => {
        if (!newUser) {
            userDislikedIngredientIds.value = [];
        }
    });

    return {
        search, allergenSearch, getActiveFilterCount, activeTab, selectedDurationId,
        selectedMealId, selectedTypeId, mealOptions, typeOptions, durationOptions,
        durationCategories, activeDuration, tabRecipes, filteredRecipes,
        hasActiveFilters, clearFilters, loadCategories, respectDislikedIngredients,
        userDislikedIngredientIds, loadUserDislikedIngredientIds, allAllergies,
        selectedAllergyIds, selectedAllergyPills, filteredAllergyPills, loadAllergies,
        removeSelectedAllergy, addSelectedAllergy
    };
});