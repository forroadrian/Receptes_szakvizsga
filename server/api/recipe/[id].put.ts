import { serverSupabaseServiceRole } from "#supabase/server";
import { Database } from "~/types/database.types";
import requireBodyKeys from "~~/server/utils/requireBodyKeys";
import { requireUser } from "~~/server/utils/requireUser";

type RecipeIngredient = {
    ingredient_id: number;
    quantity: number;
    unit: Database["public"]["Enums"]["unit"];
};

export default defineEventHandler(async (event) => {
    const admin = await serverSupabaseServiceRole<Database>(event);
    const user = await requireUser(event);
    const recipeId = Number(getRouterParam(event, "id"));

    const body = await readBody<{
        name?: string;
        description?: string;
        time?: number;
        servings?: number;
        is_public?: boolean;
        category_ids?: number[];
        ingredients?: RecipeIngredient[];
        steps?: string[];
    }>(event);

    requireBodyKeys(body, ["name", "description", "time", "servings"]);


    const { data: existing, error: fetchError } = await admin
        .from("recipe")
        .select("author_id")
        .eq("id", recipeId)
        .single();

    if (fetchError || !existing) throw createError({ statusCode: 404, message: "Recept nem található." });
    if (existing.author_id !== user.sub) throw createError({ statusCode: 403, message: "Nincs jogosultságod." });

    const { error: updateError } = await admin
        .from("recipe")
        .update({
            name: body.name?.trim() ?? "",
            description: body.description?.trim() ?? "",
            time: Number(body.time),
            servings: Number(body.servings),
            public: body.is_public ?? false,
            last_edit: new Date().toISOString()
        } as any)
        .eq("id", recipeId);

    if (updateError) throw createError({ statusCode: 500, message: updateError.message });

    await admin.from("recipe_categories").delete().eq("recipe_id", recipeId);

    const categoryIds = Array.isArray(body.category_ids) ? body.category_ids.filter((v): v is number => typeof v === "number") : [];
    if (categoryIds.length > 0) {
        const { error } = await admin.from("recipe_categories").insert(categoryIds.map(id => ({ recipe_id: recipeId, category_id: id })));
        if (error) throw createError({ statusCode: 500, message: error.message });
    }

    await admin.from("recipe_ingredients").delete().eq("recipe_id", recipeId);

    const ingredients = Array.isArray(body.ingredients) ? body.ingredients : [];
    if (ingredients.length > 0) {
        const { error } = await admin.from("recipe_ingredients").insert(ingredients.map(i => ({
            recipe_id: recipeId, ingredient_id: i.ingredient_id, quantity: i.quantity, unit: i.unit
        })));
        if (error) throw createError({ statusCode: 500, message: error.message });
    }

    const { data: oldSteps } = await admin.from("recipe_step").select("step_id").eq("recipe_id", recipeId);
    await admin.from("recipe_step").delete().eq("recipe_id", recipeId);
    if (oldSteps?.length) {
        await admin.from("step").delete().in("step_id", oldSteps.map(s => s.step_id));
    }

    const steps = Array.isArray(body.steps) ? body.steps.map(s => s.trim()).filter(Boolean) : [];
    if (steps.length > 0) {
        const { data: insertedSteps, error: stepError } = await admin
            .from("step")
            .insert(steps.map(s => ({ step_description: s })))
            .select("step_id");

        if (stepError || !insertedSteps) throw createError({ statusCode: 500, message: stepError?.message ?? "Lépések mentése sikertelen." });

        const { error } = await admin.from("recipe_step").insert(insertedSteps.map((s, i) => ({
            recipe_id: recipeId, step_id: s.step_id, step_number: i + 1
        })));
        if (error) throw createError({ statusCode: 500, message: error.message });
    }

    return { success: true };
});