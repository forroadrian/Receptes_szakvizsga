import { defineStore } from "pinia";
import Recipe from "~/models/Recipe";

export const useRecipeStore = defineStore("recipes", () => {
    const recipes = ref<Recipe[]>([]);
    const showRecipeModal = ref(false);

    const openRecipeModal = () => showRecipeModal.value = true;
    const closeRecipeModal = () => showRecipeModal.value = false;

    const getAllRecipes = computed(() => recipes.value);

    const getRecipeById = (id: number) => {
        return recipes.value.find((recipe) => recipe.id === id) ?? null;
    };

    const addRecipe = (recipe: Recipe) => {
        recipes.value.push(recipe);
    };

    const clearRecipes = () => {
        recipes.value = [];
    };

    const getRecipeSteps = (recipeData: any): string[] => {
        const steps: string[] = [];

        if (!recipeData.recipe_step?.length) {
            return steps;
        }

        const sortedSteps = [...recipeData.recipe_step].sort((firstStep, secondStep) => {
            return firstStep.step_number - secondStep.step_number;
        });

        for (const stepData of sortedSteps) {
            if (stepData.step?.step_description) {
                steps.push(stepData.step.step_description);
            }
        }

        return steps;
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
            deleted_at: recipeData.deleted_at
                ? new Date(recipeData.deleted_at)
                : undefined,
            steps: getRecipeSteps(recipeData)
        });
    };

    const getRecipes = async () => {
        try {
            const supabase = useSupabaseClient();

            const { data, error } = await supabase
                .from("recipe")
                .select(`id, author_id, name, description, saves, likes, time, servings,
                    created_at, last_edit, is_ai_generated, active, deleted_at,
                    recipe_step (
                        step_number,
                        step (
                            step_id,
                            step_description
                        )
                    )
                `);

            if (error) {
                console.error("Hiba a receptek lekérése közben:", error);
                return [];
            }

            return data ?? [];
        } catch (error) {
            console.error("Váratlan hiba a receptek lekérése közben:", error);
            return [];
        }
    };

    const loadRecipes = async () => {
        const recipeDataList = await getRecipes();

        clearRecipes();

        if (!recipeDataList.length) {
            return;
        }

        for (const recipeData of recipeDataList) {
            const recipe = createRecipe(recipeData);
            addRecipe(recipe);
        }
    };

    return {
        showRecipeModal,
        openRecipeModal,
        closeRecipeModal,
        getAllRecipes,
        getRecipeById,
        loadRecipes
    };
});