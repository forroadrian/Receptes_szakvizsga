import { hasCategory } from "./categories";

export const getFilteredRecipes = (
    tabRecipes: any[],
    search: string,
    allergenSearch: string,
    activeDuration: string | null,
    selectedMealId: number | null,
    selectedTypeId: number | null,
    respectDislikedIngredients: boolean,
    dislikedIngredientIds: number[]
) => {
    return tabRecipes.filter(recipe => {
        const searchText = search.trim().toLowerCase();
        const allergenQuery = allergenSearch.trim().toLowerCase();

        const matchesSearch =
            !searchText ||
            recipe.name.toLowerCase().includes(searchText) ||
            recipe.description.toLowerCase().includes(searchText);

        const matchesDuration =
            !activeDuration ||
            (activeDuration === "under15" && recipe.time <= 15) ||
            (activeDuration === "under30" && recipe.time <= 30) ||
            (activeDuration === "under60" && recipe.time <= 60) ||
            (activeDuration === "over60" && recipe.time > 60);

        const matchesMeal = hasCategory(recipe.categories, selectedMealId);
        const matchesType = hasCategory(recipe.categories, selectedTypeId);

        let matchesAllergen = !allergenQuery;

        if (allergenQuery) {
            for (const allergy of recipe.allergies ?? []) {
                if (allergy.name.toLowerCase().includes(allergenQuery)) {
                    matchesAllergen = true;
                }
            }
        }

        let matchesDisliked = true;

        if (respectDislikedIngredients && dislikedIngredientIds.length) {
            const hasDislikedIngredient = (recipe.ingredients ?? []).some((ingredient: any) =>
                dislikedIngredientIds.includes(ingredient.id)
            );

            if (hasDislikedIngredient) {
                matchesDisliked = false;
            }
        }

        return (matchesSearch && matchesDuration && matchesMeal && matchesType && matchesAllergen && matchesDisliked);
    });
};