import { serverSupabaseClient } from "#supabase/server";
import { Database } from "~/types/database.types";
import { requireUser } from "~~/server/utils/requireUser";
import requireBodyKeys from "~~/server/utils/requireBodyKeys";

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient<Database>(event);
    await requireUser(event);

    const body = await readBody(event);
    requireBodyKeys(body, ["menu_id", "recipe_id"]);

    const { data: menu, error: menuError } = await client
        .from("menu")
        .select("id")
        .eq("id", body.menu_id)
        .eq("active", true)
        .maybeSingle();

    if (menuError) {
        throw createError({ statusCode: 500, message: menuError.message });
    }

    if (!menu) {
        throw createError({ statusCode: 404, message: "Menu not found" });
    }

    const { data: existing } = await client
        .from("menu_recipe")
        .select("menu_id")
        .eq("menu_id", body.menu_id)
        .eq("recipe_id", body.recipe_id)
        .maybeSingle();

    if (existing) {
        throw createError({ statusCode: 409, message: "Recipe already in menu" });
    }

    const { data, error } = await client
        .from("menu_recipe")
        .insert({
            menu_id: body.menu_id,
            recipe_id: body.recipe_id,
        })
        .select()
        .single();

    if (error) {
        throw createError({ statusCode: 500, message: error.message });
    }

    return data;
});
