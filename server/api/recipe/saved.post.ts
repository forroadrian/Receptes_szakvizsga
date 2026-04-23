import { serverSupabaseServiceRole } from "#supabase/server";
import { Database } from "~/types/database.types";
import { requireUser } from "~~/server/utils/requireUser";

export default defineEventHandler(async (event) => {
    const admin = await serverSupabaseServiceRole<Database>(event);
    const user = await requireUser(event);

    const body = await readBody(event);
    const { recipe_id } = body;

    if (!recipe_id) throw createError({ statusCode: 400, message: "recipe_id is required" });

    const { data: existing, error: existingError } = await admin
        .from("user_recipe")
        .select("saved")
        .eq("user_id", user.sub)
        .eq("recipe_id", recipe_id)
        .maybeSingle();

    if (existingError) throw createError({ statusCode: 500, message: existingError.message });

    const newSaved = !existing?.saved;

    const { error: rowError } = existing
        ? await admin.from("user_recipe").update({ saved: newSaved }).eq("user_id", user.sub).eq("recipe_id", recipe_id)
        : await admin.from("user_recipe").insert({ user_id: user.sub, recipe_id, saved: true });

    if (rowError) throw createError({ statusCode: 500, message: rowError.message });

    const { data: recipe, error: fetchError } = await admin
        .from("recipe").select("likes").eq("id", recipe_id).single();

    if (fetchError) throw createError({ statusCode: 500, message: fetchError.message });

    const { error: likesError } = await admin
        .from("recipe")
        .update({ likes: Math.max(0, recipe.likes + (newSaved ? 1 : -1)) })
        .eq("id", recipe_id);

    if (likesError) throw createError({ statusCode: 500, message: likesError.message });

    return { saved: newSaved };
});