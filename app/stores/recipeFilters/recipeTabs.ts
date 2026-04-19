type RecipeTab = "default" | "own" | "saved" | "tried" | "ai";

export const getTabRecipes = (
    allRecipes: any[],
    activeTab: RecipeTab,
    userId?: string
) => {
    switch (activeTab) {
        case "default":
            return allRecipes.filter(recipe => recipe.author_id === null);

        case "own":
            return allRecipes.filter(recipe => {
                return String(recipe.author_id) === String(userId);
            });

        case "saved":
            return [];

        case "tried":
            return [];

        case "ai":
            return [];

        default:
            return [];
    }
};