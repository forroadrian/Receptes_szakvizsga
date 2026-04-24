type RecipeTab = "default" | "own" | "saved" | "tried" | "ai";

export const getTabRecipes = (
    allRecipes: any[],
    activeTab: RecipeTab,
    userId?: string,
    savedRecipeIds: number[] = [],
    triedRecipeIds: number[] = []
) => {
    switch (activeTab) {
        case "default":
            return allRecipes.filter(recipe => recipe.author_id === null || recipe.public === true);

        case "own":
            return allRecipes.filter(recipe => recipe.author_id === userId);

        case "saved":
            return allRecipes.filter(recipe => savedRecipeIds.includes(recipe.id));

        case "tried":
            return allRecipes.filter(recipe => triedRecipeIds.includes(recipe.id));

        case "ai":
            return [];

        default:
            return [];
    }
};