import { defineStore } from "pinia";
import Recipe from "~/models/Recipe";
import Ingredient from "~/models/Ingredient";
import Allergy from "~/models/Allergy";

export const useRecipeStore = defineStore("recipes", () => {
    const recipes = ref<Recipe[]>([]);
    const showRecipeModal = ref(false);

    const openRecipeModal = () => {
        showRecipeModal.value = true;
    };

    const closeRecipeModal = () => {
        showRecipeModal.value = false;
    };

    const addRecipe = (recipe: Recipe) => {
        recipes.value.push(recipe);
    };

    const clearRecipes = () => {
        recipes.value = [];
    };

    const getAllRecipes = computed(() => recipes.value);

    const getRecipeById = (id: number) => {
        return recipes.value.find(recipe => recipe.id === id) ?? null;
    };

    const getRecipeSteps = (recipeData: any): string[] => {
        const steps: string[] = [];

        if (!recipeData.recipe_step?.length) {
            return steps;
        }

        const sortedSteps = [...recipeData.recipe_step].sort(
            (firstStep, secondStep) => firstStep.step_number - secondStep.step_number
        );

        for (const stepData of sortedSteps) {
            if (stepData.step?.step_description) {
                steps.push(stepData.step.step_description);
            }
        }

        return steps;
    };

    const getRecipeIngredients = (recipeData: any): Ingredient[] => {
        const ingredients: Ingredient[] = [];

        if (!recipeData.recipe_ingredients?.length) {
            return ingredients;
        }

        for (const ingredientData of recipeData.recipe_ingredients) {
            if (!ingredientData.ingredient) {
                continue;
            }

            const ingredient = new Ingredient(
                Number(ingredientData.ingredient.id),
                ingredientData.ingredient.name,
                Number(ingredientData.quantity),
                ingredientData.unit
            );

            ingredients.push(ingredient);
        }

        return ingredients;
    };

    const getRecipeAllergies = (recipeData: any): Allergy[] => {
        const allergyMap = new Map<number, Allergy>();

        if (!recipeData.recipe_ingredients?.length) {
            return [];
        }

        for (const ingredientData of recipeData.recipe_ingredients) {
            const ingredientAllergies = ingredientData.ingredient?.ingredient_allergy ?? [];

            for (const relation of ingredientAllergies) {
                const allergy = relation.allergy;

                if (allergy?.id && allergy?.name) {
                    const allergyId = Number(allergy.id);

                    if (!allergyMap.has(allergyId)) {
                        allergyMap.set(
                            allergyId,
                            new Allergy(allergy.name, allergyId)
                        );
                    }
                }
            }
        }
        return [...allergyMap.values()];
    };

    const createRecipe = (recipeData: any): Recipe => {
        return new Recipe({
            id: Number(recipeData.id),
            author_id: recipeData.author_id,
            name: recipeData.name,
            description: recipeData.description,
            saves: recipeData.saves ?? 0,
            likes: recipeData.likes ?? 0,
            time: Number(recipeData.time),
            servings: Number(recipeData.servings),
            created_at: new Date(recipeData.created_at),
            last_edit: new Date(recipeData.last_edit),
            is_ai_generated: recipeData.is_ai_generated,
            active: recipeData.active ?? true,
            deleted_at: recipeData.deleted_at ? new Date(recipeData.deleted_at) : undefined,
            steps: getRecipeSteps(recipeData),
            ingredients: getRecipeIngredients(recipeData),
            allergies: getRecipeAllergies(recipeData),
            categories: (recipeData.recipe_categories ?? [])
                .map((item: any) => item.category)
                .filter(Boolean)
        });
    };

    const getRecipes = async () => {
        try {
            const data = await $fetch("/api/recipe", {
                method: "GET"
            })

            return Array.isArray(data) ? data : []
        } catch (error) {
            console.error("Hiba  a receptek lekérése közben:", error)
            return [];
        }
    }

    const loadRecipes = async () => {
        const recipeDataList = await getRecipes() || [];

        clearRecipes();

        for (const recipeData of recipeDataList) {
            addRecipe(createRecipe(recipeData));
        }
    };

    return {
        recipes,
        showRecipeModal,
        openRecipeModal,
        closeRecipeModal,
        getAllRecipes,
        getRecipeById,
        loadRecipes
    };
});