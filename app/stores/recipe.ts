import { defineStore } from "pinia";
import Recipe from "~/models/Recipe";

export const useRecipeStore = defineStore("recipes", () => {
    const recipes = ref<Recipe[]>([]);
    const showRecipeModal = ref(false);

    const openRecipeModal = () => showRecipeModal.value = true;
    const closeRecipeModal = () => showRecipeModal.value = false;

    const pushRecipe = (recipe: Recipe) => {
        recipes.value.push(recipe);
    }

    const fetchRecipes = async () => {
        try {
            const supabase = useSupabaseClient();

            const { data, error } = await supabase
                .from("recipe")
                .select(`id, author_id, name, description, saves, likes, time, servings,
                    created_at, last_edit, is_ai_generated, active, deleted_at`);

            if (error) {
                console.error(error);
                return [];
            }

            return data ?? [];
        } catch (error) {
            alert(error);
            return [];
        }
    }

    const loadRecipes = async () => {
        const res = await fetchRecipes();

        recipes.value = [];

        if (res?.length != 0 && res != undefined) {
            for (const recipeData of res) {
                const recipe = new Recipe({
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
                        : undefined
                });

                pushRecipe(recipe);
            }
        }
    }

    return {
        openRecipeModal,
        closeRecipeModal,
        pushRecipe,
        fetchRecipes,
        loadRecipes,
        showRecipeModal,
        recipes
    }
})