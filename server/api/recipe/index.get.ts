import { serverSupabaseServiceRole, serverSupabaseUser } from "#supabase/server";
import { Database } from "~/types/database.types";

export default defineEventHandler(async (event) => {
    const admin = await serverSupabaseServiceRole<Database>(event);
    const user = await serverSupabaseUser(event);

    let query = admin
        .from("recipe")
        .select(`
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
        `);

    if (!user) {
        query = query.is("author_id", null);
    }

    const { data, error } = await query;

    if (error) {
        throw createError({ message: error.message });
    }

    return data;
});