import { serverSupabaseServiceRole } from "#supabase/server";
import { Database } from "~/types/database.types";
import { requireUser } from "~~/server/utils/requireUser";

export default defineEventHandler(async (event) => {
    const admin = await serverSupabaseServiceRole<Database>(event);
    const user = await requireUser(event);

    const { data, error } = await admin
        .from("user_recipe")
        .select("recipe_id")
        .eq("user_id", user.sub)
        .eq("saved", true);

    if (error) throw createError({ statusCode: 500, message: error.message });

    return data.map((row) => row.recipe_id);
});