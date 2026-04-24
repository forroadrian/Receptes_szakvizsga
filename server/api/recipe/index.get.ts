import { serverSupabaseServiceRole } from "#supabase/server";
import { Database } from "~/types/database.types";

const recipeSelect = `
    id, author_id, name, description, saves, likes, time, servings,
    created_at, last_edit, is_ai_generated, active, deleted_at, public,
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

export default defineEventHandler(async (event) => {
    const admin = await serverSupabaseServiceRole<Database>(event);

    const { data, error } = await admin
        .from("recipe")
        .select(recipeSelect)
        .eq("active", true)
        .is("deleted_at", null)
        .order("name", { ascending: true })
        .order("id", { ascending: true });

    if (error) {
        throw createError({
            statusCode: 500,
            message: error.message
        });
    }

    return data;
});