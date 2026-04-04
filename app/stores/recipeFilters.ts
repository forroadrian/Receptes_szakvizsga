import { defineStore } from "pinia";
import type Category from "~/interfaces/Category";
import { useRecipeStore } from "~/stores/recipe";

type RecipeTab = "default" | "own" | "saved" | "tried" | "ai";
type CategoryOption = Category;

export const useRecipeFilterStore = defineStore("recipeFilters", () => {
    const supabase = useSupabaseClient();
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

    const durationOptions = [
        { id: 1, label: "15 percen belül", value: "under15" },
        { id: 2, label: "30 percen belül", value: "under30" },
        { id: 3, label: "1 órán belül", value: "under60" },
        { id: 4, label: "1 órán túl", value: "over60" }
    ];

    const durationCategories = computed(() => {
        return durationOptions.map(option => {
            return {
                id: option.id,
                name: option.label,
                group_type: null
            };
        });
    });

    const activeDuration = computed(() => {
        const selectedOption = durationOptions.find(option => {
            return option.id === selectedDurationId.value;
        });

        if (!selectedOption) {
            return null;
        }

        return selectedOption.value;
    });

    const hasCategory = (
        categories: Category[] | undefined,
        categoryId: number | null
    ) => {
        if (categoryId === null) {
            return true;
        }

        if (!categories) {
            return false;
        }

        const found = categories.find(category => category.id === categoryId);
        return found !== undefined;
    };
    const tabRecipes = computed(() => {
        const allRecipes = recipeStore.getAllRecipes;

        switch (activeTab.value) {
            case "own":
                return allRecipes.filter(recipe => {
                    return recipe.author_id === user.value?.id;
                });

            case "saved":
                return [];

            case "tried":
                return [];

            case "ai":
                return [];

            default:
                return allRecipes;
        }
    });

    const filteredRecipes = computed(() => {
        return tabRecipes.value.filter(recipe => {
            const searchText = search.value.trim().toLowerCase();
            const allergenQuery = allergenSearch.value.trim().toLowerCase();

            let matchesSearch = true;
            if (searchText) {
                const nameMatches = recipe.name.toLowerCase().includes(searchText);
                const descriptionMatches = recipe.description.toLowerCase().includes(searchText);

                matchesSearch = nameMatches || descriptionMatches;
            }

            let matchesDuration = true;
            if (activeDuration.value === "under15") {
                matchesDuration = recipe.time <= 15;
            } else if (activeDuration.value === "under30") {
                matchesDuration = recipe.time <= 30;
            } else if (activeDuration.value === "under60") {
                matchesDuration = recipe.time <= 60;
            } else if (activeDuration.value === "over60") {
                matchesDuration = recipe.time > 60;
            }

            const matchesMeal = hasCategory(recipe.categories, selectedMealId.value);
            const matchesType = hasCategory(recipe.categories, selectedTypeId.value);

            let matchesAllergen = true;

            if (allergenQuery) {
                if (!recipe.categories) {
                    matchesAllergen = false;
                } else {
                    const found = recipe.categories.find(category =>
                        category.name.toLowerCase().includes(allergenQuery)
                    );

                    matchesAllergen = found !== undefined;
                }
            }

            return [matchesSearch, matchesDuration, matchesMeal, matchesType,matchesAllergen].every(
                value => value === true);
        });
    });

    const hasActiveFilters = computed(() => {
        return (
            search.value !== "" ||  allergenSearch.value !== "" ||
            selectedDurationId.value !== null || selectedMealId.value !== null ||
            selectedTypeId.value !== null || activeTab.value !== "default"
        );
    });

    const clearFilters = () => {
        search.value = "";
        allergenSearch.value = "";
        selectedDurationId.value = null;
        selectedMealId.value = null;
        selectedTypeId.value = null;
        activeTab.value = "default";
    };

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

        mealOptions.value = categories.filter(category => {
            return String(category.group_type).toLowerCase() === "meal";
        });

        typeOptions.value = categories.filter(category => {
            return String(category.group_type).toLowerCase() === "type";
        });
    };

    return { 
        search, allergenSearch, activeTab, selectedDurationId, selectedMealId, selectedTypeId,
        mealOptions, typeOptions, durationOptions, durationCategories, activeDuration, tabRecipes,
        filteredRecipes, hasActiveFilters, clearFilters, loadCategories
    };
});