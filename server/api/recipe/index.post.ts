import { serverSupabaseServiceRole } from "#supabase/server";
import { Database } from "~/types/database.types";
import requireBodyKeys from "~~/server/utils/requireBodyKeys";
import { requireUser } from "~~/server/utils/requireUser";

const recipeSelect = `
    id, author_id, name, description, saves, likes, time, servings,
    created_at, last_edit, is_ai_generated, active, deleted_at,
    recipe_step (
        step_number,
        step (
            step_id,
            step_description
        )
    ),
    recipe_ingredients (
        quantity,
        unit,
        ingredient (
            id,
            name,
            ingredient_allergy (
                allergy (
                    id,
                    name
                )
            )
        )
    ),
    recipe_categories (
        category (
            id,
            name,
            group_type
        )
    )
`;

type RecipeIngredient = {
    ingredient_id: number;
    quantity: number;
    unit: Database["public"]["Enums"]["unit"];
};

export default defineEventHandler(async (event) => {
    const admin = await serverSupabaseServiceRole<Database>(event);
    const user = await requireUser(event);
    const userId = String(user.sub);

    const body = await readBody<{
        name?: string;
        description?: string;
        time?: number;
        servings?: number;
        category_ids?: number[];
        ingredients?: RecipeIngredient[];
        steps?: string[];
    }>(event);

    requireBodyKeys(body, ["name", "description", "time", "servings"]);

    const selectedCategoryIds = Array.isArray(body.category_ids)
        ? body.category_ids.filter((value): value is number => typeof value === "number"): [];

    const selectedIngredients = Array.isArray(body.ingredients)
        ? body.ingredients.filter((value): value is RecipeIngredient => {
            return typeof value === "object"
                && value !== null
                && typeof value.ingredient_id === "number"
                && typeof value.quantity === "number"
                && typeof value.unit === "string";
        })
        : [];

    const selectedSteps = Array.isArray(body.steps)
        ? body.steps
            .filter((value): value is string => typeof value === "string")
            .map((value) => value.trim())
            .filter(Boolean)
        : [];

    const recipeInsert: Database["public"]["Tables"]["recipe"]["Insert"] = {
        author_id: userId as string,
        name: body.name?.trim() ?? "",
        description: body.description?.trim() ?? "",
        time: Number(body.time),
        servings: Number(body.servings),
        is_ai_generated: false
    };

    const { data: recipeData, error: recipeError } = await admin
        .from("recipe")
        .insert(recipeInsert)
        .select("id")
        .single();

    if (recipeError || !recipeData) {
        throw createError({
            statusCode: 500,
            message: recipeError?.message || "Nem sikerült elmenteni a receptet."
        });
    }

    if (selectedCategoryIds.length > 0) {
        const recipeCategories = selectedCategoryIds.map((categoryId) => ({
            recipe_id: recipeData.id,
            category_id: categoryId
        }));

        const { error: recipeCategoriesError } = await admin
            .from("recipe_categories")
            .insert(recipeCategories);

        if (recipeCategoriesError) {
            throw createError({
                statusCode: 500,
                message: recipeCategoriesError.message
            });
        }
    }

    if (selectedIngredients.length > 0) {
        const recipeIngredients = selectedIngredients.map((ingredient) => ({
            recipe_id: recipeData.id,
            ingredient_id: ingredient.ingredient_id,
            quantity: ingredient.quantity,
            unit: ingredient.unit
        }));

        const { error: recipeIngredientsError } = await admin
            .from("recipe_ingredients")
            .insert(recipeIngredients);

        if (recipeIngredientsError) {
            throw createError({
                statusCode: 500,
                message: recipeIngredientsError.message
            });
        }
    }

    if (selectedSteps.length > 0) {
        const { data: insertedSteps, error: stepInsertError } = await admin
            .from("step")
            .insert(selectedSteps.map((step) => ({ step_description: step })))
            .select("step_id");

        if (stepInsertError || !insertedSteps) {
            throw createError({
                statusCode: 500,
                message: stepInsertError?.message || "Nem sikerült elmenteni a lépéseket."
            });
        }

        const recipeStep = insertedSteps.map((step, index) => ({
            recipe_id: recipeData.id,
            step_id: step.step_id,
            step_number: index + 1
        }));

        const { error: recipeStepError } = await admin
            .from("recipe_step")
            .insert(recipeStep);

        if (recipeStepError) {
            throw createError({
                statusCode: 500,
                message: recipeStepError.message
            });
        }
    }

    const { data, error } = await admin
        .from("recipe")
        .select(recipeSelect)
        .eq("id", recipeData.id)
        .single();

    if (error) {
        throw createError({
            statusCode: 500,
            message: error.message
        });
    }

    return data;
});