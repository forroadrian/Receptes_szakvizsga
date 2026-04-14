import { serverSupabaseClient } from "#supabase/server";
import { Database } from "~/types/database.types";
import { requireUser } from "~~/server/utils/requireUser";
import requireBodyKeys from "~~/server/utils/requireBodyKeys";

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient<Database>(event);
    const user = await requireUser(event);

    const body = await readBody(event);
    requireBodyKeys(body, ["name", "date", "recipe_ids"]);

    if (!Array.isArray(body.recipe_ids) || body.recipe_ids.length === 0) {
        throw createError({ statusCode: 400, message: "recipe_ids must be an array" });
    }

    const { data: menu, error: menuError } = await client
        .from("menu")
        .insert({
            name: body.name,
            planned_date: body.date,
            user_id: user.id,
        })
        .select()
        .single();

    if (menuError) {
        throw createError({ statusCode: 500, message: menuError.message });
    }

    const menuRecipes = body.recipe_ids.map((recipeId: number) => ({
        menu_id: menu.id,
        recipe_id: recipeId,
    }));

    const { error: menuRecipeError } = await client
        .from("menu_recipe")
        .insert(menuRecipes);

    if (menuRecipeError) {
        throw createError({ statusCode: 500, message: menuRecipeError.message });
    }

    return menu;
});
