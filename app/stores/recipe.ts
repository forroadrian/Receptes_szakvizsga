import { defineStore } from "pinia";
import Recipe from "~/models/Recipe";
import Ingredient from "~/models/Ingredient";
import Allergy from "~/models/Allergy";
import type Category from "~/interfaces/Category";

export const useRecipeStore = defineStore("recipes", () => {
    const recipes = ref<Recipe[]>([]);
    const showRecipeModal = ref(false);

    const openRecipeModal = () => showRecipeModal.value = true;
    const closeRecipeModal = () => showRecipeModal.value = false;

    const pushRecipe = (recipe: Recipe) => {
        recipes.value.push(recipe);
    };

    const getAllRecipes = () => {
        return recipes.value;
    };

    const getRecipeById = (id: number) => {
        const recipe = recipes.value.find((value) => value.id === id);
        if (recipe != undefined) return recipe;
        return null;
    };

    const fetchRecipes = async () => {
        try {
            return await $fetch("/api/recipe", { method: "GET" });
        } catch (error) {
            alert(error);
        }
    };

    const loadRecipes = async () => {
        recipes.value = [];
        const res = await fetchRecipes();

        if (!res || res.length === 0) return;

        for (const recipeData of res) {
            const steps: string[] = [];
            const ingredients: Ingredient[] = [];
            const allergies: Allergy[] = [];
            const allergyIds: number[] = [];
            const categories: Category[] = [];

            if (recipeData.recipe_step) {
                const sortedSteps = recipeData.recipe_step.sort(
                    (a, b) => a.step_number - b.step_number
                );

                for (const stepItem of sortedSteps) {
                    if (stepItem.step?.step_description) {
                        steps.push(stepItem.step.step_description);
                    }
                }
            }

            if (recipeData.recipe_ingredients) {
                for (const ingredientItem of recipeData.recipe_ingredients) {
                    if (ingredientItem.ingredient) {
                        const ingredient = new Ingredient(ingredientItem.ingredient.id,
                            ingredientItem.ingredient.name, ingredientItem.quantity, ingredientItem.unit);

                        ingredients.push(ingredient);

                        if (ingredientItem.ingredient.ingredient_allergy) {
                            for (const allergyRelation of ingredientItem.ingredient.ingredient_allergy) {
                                if (allergyRelation.allergy && !allergyIds.includes(allergyRelation.allergy.id)) {
                                    allergyIds.push(allergyRelation.allergy.id);
                                    allergies.push(new Allergy( allergyRelation.allergy.name, allergyRelation.allergy.id)
                                    );
                                }
                            }
                        }
                    }
                }
            }

            if (recipeData.recipe_categories) {
                for (const categoryItem of recipeData.recipe_categories) {
                    const categoryData = categoryItem.category as {
                        id: number;
                        name: string;
                        group_type: string | null;
                    } | undefined;

                    if (categoryData) {
                        const category: Category = {
                            id: categoryData.id,
                            name: categoryData.name,
                            group_type: categoryData.group_type ?? ""
                        };

                        categories.push(category);
                    }
                }
            }

            const recipe = new Recipe({
                id: recipeData.id,
                author_id: recipeData.author_id,
                name: recipeData.name,
                description: recipeData.description,
                saves: recipeData.saves ?? 0,
                likes: recipeData.likes ?? 0,
                time: recipeData.time,
                servings: recipeData.servings,
                created_at: new Date(recipeData.created_at),
                last_edit: new Date(recipeData.last_edit),
                is_ai_generated: recipeData.is_ai_generated,
                active: recipeData.active ?? true,
                deleted_at: recipeData.deleted_at ? new Date(recipeData.deleted_at) : undefined,
                steps,
                ingredients,
                categories,
                allergies
            });

            pushRecipe(recipe);
        }
    };

    return {
        openRecipeModal,
        closeRecipeModal,
        pushRecipe,
        getAllRecipes,
        getRecipeById,
        fetchRecipes,
        loadRecipes,
        showRecipeModal
    };
});