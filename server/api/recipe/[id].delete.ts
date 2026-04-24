import { serverSupabaseServiceRole } from "#supabase/server";
import { Database } from "~/types/database.types";
import { requireUser } from "~~/server/utils/requireUser";

export default defineEventHandler(async (event) => {
    const admin = await serverSupabaseServiceRole<Database>(event);
    const user = await requireUser(event);
    const recipeId = Number(getRouterParam(event, "id"));

    const { data: existing, error: fetchError } = await admin
        .from("recipe")
        .select("author_id")
        .eq("id", recipeId)
        .single();

    if (fetchError || !existing) throw createError({ statusCode: 404, message: "Recept nem található." });
    if (existing.author_id !== user.sub) throw createError({ statusCode: 403, message: "Nincs jogosultságod." });

    const { data: recipeSteps } = await admin
        .from("recipe_step")
        .select("step_id")
        .eq("recipe_id", recipeId);


    await admin.from("menu_recipe").delete().eq("recipe_id", recipeId);
    await admin.from("user_recipe").delete().eq("recipe_id", recipeId);
    await admin.from("recipe_categories").delete().eq("recipe_id", recipeId);
    await admin.from("recipe_ingredients").delete().eq("recipe_id", recipeId);
    await admin.from("recipe_step").delete().eq("recipe_id", recipeId);


    if (recipeSteps?.length) {
        await admin.from("step").delete().in("step_id", recipeSteps.map(s => s.step_id));
    }

    const { error } = await admin.from("recipe").delete().eq("id", recipeId);
    if (error) throw createError({ statusCode: 500, message: error.message });

    return { success: true };
});