import { hasCategory } from "./categories";

export const getFilteredRecipes = (
    tabRecipes: any[],
    search: string,
    activeDuration: string | null,
    selectedMealId: number | null,
    selectedTypeId: number | null,
    respectDislikedIngredients: boolean,
    dislikedIngredientIds: number[],
    selectedAllergyIds: number[] = []
) => {
    return tabRecipes.filter(recipe => {
        const searchText = search.trim().toLowerCase();

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

        let matchesAllergen = selectedAllergyIds.length === 0;

        if (selectedAllergyIds.length) {
            const recipeAllergyIds = (recipe.allergies ?? []).map((allergy: any) => allergy.id);
            matchesAllergen = !selectedAllergyIds.some(allergyId => recipeAllergyIds.includes(allergyId));
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