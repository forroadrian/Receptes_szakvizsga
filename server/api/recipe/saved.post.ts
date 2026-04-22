import { serverSupabaseServiceRole, serverSupabaseUser } from "#supabase/server";

type SavedBody = {
    recipeId: number;
    saved: boolean;
};

type UserRecipeRow = {
    recipe_id: number;
    user_id: string;
    saved: boolean | null;
    tried: boolean | null;
};

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event);

    if (!user?.id) {
        throw createError({
            statusCode: 401,
            statusMessage: "Nincs bejelentkezett user."
        });
    }

    const body = await readBody<SavedBody>(event);
    const supabase = serverSupabaseServiceRole(event);

    const { data: existingRow, error: fetchError } = await supabase
        .from("user_recipe")
        .select("recipe_id, user_id, saved, tried")
        .eq("user_id", user.id)
        .eq("recipe_id", body.recipeId)
        .maybeSingle<UserRecipeRow>();

    if (fetchError) {
        throw createError({
            statusCode: 500,
            statusMessage: fetchError.message
        });
    }

    if (!body.saved) {
        const { error: deleteError } = await supabase
            .from("user_recipe")
            .delete()
            .eq("user_id", user.id)
            .eq("recipe_id", body.recipeId);

        if (deleteError) {
            throw createError({
                statusCode: 500,
                statusMessage: deleteError.message
            });
        }

        const { data: recipeRow, error: recipeFetchError } = await supabase
            .from("recipe")
            .select("saves")
            .eq("id", body.recipeId)
            .single<{ saves: number }>();

        if (recipeFetchError) {
            throw createError({
                statusCode: 500,
                statusMessage: recipeFetchError.message
            });
        }

        const { error: recipeUpdateError } = await supabase
            .from("recipe")
            .update({
                saves: Math.max((recipeRow?.saves ?? 1) - 1, 0)
            })
            .eq("id", body.recipeId);

        if (recipeUpdateError) {
            throw createError({
                statusCode: 500,
                statusMessage: recipeUpdateError.message
            });
        }

        return { success: true };
    }

    if (existingRow) {
        if (existingRow.saved) {
            return { success: true };
        }

        const { error: updateError } = await supabase
            .from("user_recipe")
            .update({
                saved: true,
                tried: existingRow.tried ?? false
            })
            .eq("user_id", user.id)
            .eq("recipe_id", body.recipeId);

        if (updateError) {
            throw createError({
                statusCode: 500,
                statusMessage: updateError.message
            });
        }
    } else {
        const { error: insertError } = await supabase
            .from("user_recipe")
            .insert({
                user_id: user.id,
                recipe_id: body.recipeId,
                saved: true,
                tried: false
            });

        if (insertError) {
            throw createError({
                statusCode: 500,
                statusMessage: insertError.message
            });
        }
    }

    const { data: recipeRow, error: recipeFetchError } = await supabase
        .from("recipe")
        .select("saves")
        .eq("id", body.recipeId)
        .single<{ saves: number }>();

    if (recipeFetchError) {
        throw createError({
            statusCode: 500,
            statusMessage: recipeFetchError.message
        });
    }

    const { error: recipeUpdateError } = await supabase
        .from("recipe")
        .update({
            saves: (recipeRow?.saves ?? 0) + 1
        })
        .eq("id", body.recipeId);

    if (recipeUpdateError) {
        throw createError({
            statusCode: 500,
            statusMessage: recipeUpdateError.message
        });
    }

    return { success: true };
});