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
        .select("tried")
        .eq("user_id", user.sub)
        .eq("recipe_id", recipe_id)
        .maybeSingle();

    if (existingError) throw createError({ statusCode: 500, message: existingError.message });

    const newTried = !existing?.tried;

    const { error: rowError } = existing
        ? await admin.from("user_recipe").update({ tried: newTried }).eq("user_id", user.sub).eq("recipe_id", recipe_id)
        : await admin.from("user_recipe").insert({ user_id: user.sub, recipe_id, tried: true });

    if (rowError) throw createError({ statusCode: 500, message: rowError.message });

    const { data: recipe, error: fetchError } = await admin
        .from("recipe").select("saves").eq("id", recipe_id).single();

    if (fetchError) throw createError({ statusCode: 500, message: fetchError.message });

    const { error: savesError } = await admin
        .from("recipe")
        .update({ saves: Math.max(0, recipe.saves + (newTried ? 1 : -1)) })
        .eq("id", recipe_id);

    if (savesError) throw createError({ statusCode: 500, message: savesError.message });

    return { tried: newTried };
});