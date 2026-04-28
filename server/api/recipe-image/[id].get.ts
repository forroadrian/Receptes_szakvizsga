import { serverSupabaseServiceRole } from "#supabase/server";
import { Database } from "~/types/database.types";

export default defineEventHandler(async (event) => {
    const admin = await serverSupabaseServiceRole<Database>(event);
    const recipeId = Number(getRouterParam(event, "id"));

    if (!recipeId || isNaN(recipeId)) {
        throw createError({ statusCode: 400, message: "Érvénytelen recept azonosító." });
    }

    const { data, error } = await admin
        .from("recipe")
        .select("image_url")
        .eq("id", recipeId)
        .single();

    if (error || !data) {
        throw createError({ statusCode: 404, message: "Recept nem található." });
    }

    return { imageUrl: (data as any).image_url ?? null };
});