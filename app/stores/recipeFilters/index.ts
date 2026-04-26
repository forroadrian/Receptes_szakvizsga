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

    type AiRecipe = {
        id: string;
        name: string;
        description: string;
        reason: string;
        prepTime: number;
        servings: number;
        mealType: string;
        tags: string[];
        ingredients: { name: string; quantity: number; unit: string }[];
        instructions: string[];
        // compatibility fields for the recipe card template:
        time: number;
        categories: { id: string; name: string; group_type: string }[];
        allergies: { id: number; name: string }[];
        author_id: null;
        public: boolean;
        isAi: true;
    };

    const aiRecommendedRecipes = ref<AiRecipe[]>([]);
    const aiLoading = ref(false);
    const aiLoaded = ref(false);

    const durationCategories = computed(() => getDurationCategories());
    const activeDuration = computed(() => getActiveDuration(selectedDurationId.value));

    const { selectedAllergyPills, filteredAllergyPills, loadAllergies } = createAllergyFilters(
        allAllergies, selectedAllergyIds, allergenSearch
    );

    const shouldRespectDislikedIngredients = computed(() => !!user.value && respectDislikedIngredients.value);

    const tabRecipes = computed(() => {
        if (activeTab.value === "ai") return aiRecommendedRecipes.value as any[];
        return getTabRecipes(recipeStore.getAllRecipes(), activeTab.value, user.value?.id ?? user.value?.sub, savedRecipeIds.value, triedRecipeIds.value);
    });

    const filteredRecipes = computed(() => {
        if (activeTab.value === "ai") return aiRecommendedRecipes.value as any[];
        return getFilteredRecipes(
            tabRecipes.value, search.value,
            activeDuration.value, selectedMealId.value, selectedTypeId.value,
            shouldRespectDislikedIngredients.value,
            userDislikedIngredientIds.value,
            selectedAllergyIds.value
        );
    });

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

    const durationToMinutes = (durationId: number | null): { max?: number; min?: number } => {
        switch (durationId) {
            case 1: return { max: 15 };
            case 2: return { max: 30 };
            case 3: return { max: 60 };
            case 4: return { min: 60 };
            default: return {};
        }
    };

    const loadAiRecommendations = async (params: { language: string; userAllergyIds: number[]; force?: boolean }) => {
        if (aiLoading.value) return;
        if (aiLoaded.value && !params.force) return;
        aiLoading.value = true;
        aiError.value = null;

        const pantry = ingredientStore.ingredients.map(i => ({ name: i.name, quantity: i.quantity, unit: i.unit }));

        // Map filter IDs to names for the AI
        const mealTypeName = selectedMealId.value
            ? mealOptions.value.find(m => m.id === selectedMealId.value)?.name
            : undefined;
        const tagName = selectedTypeId.value
            ? typeOptions.value.find(t => t.id === selectedTypeId.value)?.name
            : undefined;
        const tagsList = tagName ? [tagName] : [];

        const duration = durationToMinutes(selectedDurationId.value);

        const userAllergyNames = allAllergies.value
            .filter(a => params.userAllergyIds.includes(a.id))
            .map(a => a.name);

        const filterAllergyNames = allAllergies.value
            .filter(a => selectedAllergyIds.value.includes(a.id))
            .map(a => a.name);

        const avoidAllergens = Array.from(new Set([...userAllergyNames, ...filterAllergyNames]));

        const dislikedIngredientNames = shouldRespectDislikedIngredients.value
            ? ingredientStore.availableIngredients
                .filter(i => userDislikedIngredientIds.value.includes(i.id))
                .map(i => i.name)
            : [];

        const availableMealTypes = mealOptions.value.map(m => m.name);
        const availableTags = typeOptions.value.map(t => t.name);
        // Send a limited catalog. Prefer pantry-matched first, then fill up with the rest.
        const pantryNames = new Set(pantry.map(p => p.name.toLowerCase()));
        const allIngredientNames = ingredientStore.availableIngredients.map(i => i.name);
        const pantryIngredientNames = allIngredientNames.filter(n => pantryNames.has(n.toLowerCase()));
        const otherIngredientNames = allIngredientNames.filter(n => !pantryNames.has(n.toLowerCase()));
        const availableIngredients = [...pantryIngredientNames, ...otherIngredientNames].slice(0, 150);

        try {
            const result = await $fetch<any[]>('/api/recipe/ai-recommendations', {
                method: 'POST',
                body: {
                    language: params.language,
                    pantry,
                    filters: {
                        mealType: mealTypeName,
                        tags: tagsList,
                        maxDuration: duration.max,
                        minDuration: duration.min,
                        avoidAllergens,
                        avoidIngredients: dislikedIngredientNames,
                        search: search.value || undefined
                    },
                    availableMealTypes,
                    availableTags,
                    availableIngredients
                }
            });

            aiRecommendedRecipes.value = (result ?? []).map((r: any) => ({
                id: r.id,
                name: r.name,
                description: r.description,
                reason: r.reason,
                prepTime: r.prepTime,
                servings: r.servings,
                mealType: r.mealType,
                tags: r.tags,
                ingredients: r.ingredients,
                instructions: r.instructions,
                // template compatibility:
                time: r.prepTime,
                categories: [
                    ...(r.mealType ? [{ id: `ai-meal-${r.mealType}`, name: r.mealType, group_type: 'meal' }] : []),
                    ...((r.tags ?? []).map((tagName: string) => ({ id: `ai-tag-${tagName}`, name: tagName, group_type: 'type' })))
                ],
                allergies: [],
                author_id: null,
                public: false,
                isAi: true as const
            }));
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

    const getAiReason = (recipeId: string | number): string => {
        return aiRecommendedRecipes.value.find(r => r.id === String(recipeId))?.reason ?? '';
    };

    const getAiRecipe = (recipeId: string | number): AiRecipe | null => {
        return aiRecommendedRecipes.value.find(r => r.id === String(recipeId)) ?? null;
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
        loadAiRecommendations, getAiReason, getAiRecipe
    };
});