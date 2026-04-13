type RecipeTab = "default" | "own" | "saved" | "tried" | "ai";

export const getTabRecipes = (
    allRecipes: any[],
    activeTab: RecipeTab,
    userId?: string
) => {
    switch (activeTab) {
        case "own":
            return allRecipes.filter(recipe => {
                return recipe.author_id === userId;
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
};