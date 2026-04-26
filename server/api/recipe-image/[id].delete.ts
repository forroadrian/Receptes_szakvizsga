import { serverSupabaseServiceRole } from "#supabase/server";
import { Database } from "~/types/database.types";
import { requireUser } from "~~/server/utils/requireUser";

export default defineEventHandler(async (event) => {
    const admin = await serverSupabaseServiceRole<Database>(event);
    const user = await requireUser(event);
    const recipeId = Number(getRouterParam(event, "id"));

    if (!recipeId || isNaN(recipeId)) {
        throw createError({ statusCode: 400, message: "Érvénytelen recept azonosító." });
    }

    const { data: existing, error: fetchError } = await admin
        .from("recipe")
        .select("author_id")
        .eq("id", recipeId)
        .single();

    if (fetchError || !existing) {
        throw createError({ statusCode: 404, message: "Recept nem található." });
    }

    if (existing.author_id !== user.sub) {
        throw createError({ statusCode: 403, message: "Nincs jogosultságod." });
    }

    const { error: updateError } = await admin
        .from("recipe")
        .update({ image_url: null } as any)
        .eq("id", recipeId);

    if (updateError) {
        throw createError({ statusCode: 500, message: updateError.message });
    }

    return { success: true };
});