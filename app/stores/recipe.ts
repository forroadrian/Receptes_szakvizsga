import { defineStore } from "pinia";
import { ref } from "vue";
import type Category from "~/interfaces/Category";

export type RecipeItem = {
    id: number;
    author_id: string | null;
    name: string;
    description: string;
    saves: number;
    likes: number;
    time: number;
    servings: number;
    created_at: string;
    last_edit: string;
    is_ai_generated: boolean;
    active: boolean;
    deleted_at: string | null;
    steps: string[];
    ingredients: {
        id: number;
        name: string;
        quantity: number;
        unit: string;
    }[];
    categories: Category[];
    allergies: {
        id: number;
        name: string;
    }[];
};

type RecipeApiResponse = any;

export const useRecipeStore = defineStore("recipes", () => {
    const recipes = ref<RecipeItem[]>([]);

    const getAllRecipes = () => recipes.value;

    const pushRecipe = (recipe: RecipeItem) => {
        recipes.value.push(recipe);
    };

    const fetchRecipes = async () => {
        try {
            const response = await $fetch<RecipeApiResponse[]>("/api/recipe", {
                method: "GET"
            });
            return response;
        } catch (error) {
            alert(error);
        }
    };

    const loadRecipes = async () => {
        recipes.value = [];

        const response = await fetchRecipes();

        if (response?.length && response !== undefined) {
            for (const recipeData of response) {
                const stepList: string[] = [];
                const ingredientList: RecipeItem["ingredients"] = [];
                const categoryList: Category[] = [];
                const allergyList: RecipeItem["allergies"] = [];
                const collectedAllergyIds: number[] = [];

                if (recipeData.recipe_step) {
                    const sortedSteps = [...recipeData.recipe_step].sort(
                        (firstStep, secondStep) =>
                            firstStep.step_number - secondStep.step_number
                    );

                    for (const stepData of sortedSteps) {
                        const stepDescription = stepData.step?.step_description?.trim();
                        if (stepDescription) stepList.push(stepDescription);
                    }
                }

                if (recipeData.recipe_ingredients) {
                    for (const recipeIngredient of recipeData.recipe_ingredients) {
                        const ingredientData = recipeIngredient.ingredient;

                        if (ingredientData) {
                            ingredientList.push({
                                id: ingredientData.id,
                                name: ingredientData.name,
                                quantity: recipeIngredient.quantity,
                                unit: recipeIngredient.unit
                            });

                            if (ingredientData.ingredient_allergy) {
                                for (const ingredientAllergyRelation of ingredientData.ingredient_allergy) {
                                    const allergyData = ingredientAllergyRelation.allergy;

                                    if (
                                        allergyData &&
                                        !collectedAllergyIds.includes(allergyData.id)
                                    ) {
                                        collectedAllergyIds.push(allergyData.id);
                                        allergyList.push({
                                            id: allergyData.id,
                                            name: allergyData.name
                                        });
                                    }
                                }
                            }
                        }
                    }
                }

                if (recipeData.recipe_categories) {
                    for (const recipeCategory of recipeData.recipe_categories) {
                        const categoryData = recipeCategory.category;

                        if (categoryData) {
                            categoryList.push({
                                id: categoryData.id,
                                name: categoryData.name,
                                group_type: categoryData.group_type ?? ""
                            });
                        }
                    }
                }

                const recipe: RecipeItem = {
                    id: recipeData.id,
                    author_id: recipeData.author_id,
                    name: recipeData.name,
                    description: recipeData.description,
                    saves: recipeData.saves ?? 0,
                    likes: recipeData.likes ?? 0,
                    time: recipeData.time,
                    servings: recipeData.servings,
                    created_at: recipeData.created_at,
                    last_edit: recipeData.last_edit,
                    is_ai_generated: recipeData.is_ai_generated,
                    active: recipeData.active ?? true,
                    deleted_at: recipeData.deleted_at ?? null,
                    steps: stepList,
                    ingredients: ingredientList,
                    categories: categoryList,
                    allergies: allergyList
                };

                pushRecipe(recipe);
            }

            recipes.value.sort(
                (firstRecipe, secondRecipe) =>
                    firstRecipe.name.localeCompare(secondRecipe.name, "hu") ||
                    firstRecipe.id - secondRecipe.id
            );
        }
    };

    const getRecipeById = (recipeId: number) => {
        return recipes.value.find((recipe) => recipe.id === recipeId) ?? null;
    };

    return {
        getAllRecipes,
        getRecipeById,
        pushRecipe,
        fetchRecipes,
        loadRecipes
    };
});