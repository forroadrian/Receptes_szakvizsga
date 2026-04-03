import { serverSupabaseClient } from "#supabase/server";
import type { Database } from "~/types/database.types";
import requireBodyKeys from "~~/server/utils/requireBodyKeys";
import { requireUser } from "~~/server/utils/requireUser";

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient<Database>(event);
    const authUser = await requireUser(event);
    const body = await readBody(event);

    requireBodyKeys(body, ["ingredientIds"]);

    const ingredientIds: number[] = Array.isArray(body.ingredientIds)
        ? body.ingredientIds.map((ingredientId: unknown) => Number(ingredientId))
        : [];

    if (!ingredientIds.length) {
        throw createError({
            statusCode: 400,
            message: "Missing required field: ingredientIds",
        });
    }

    const userId = authUser.id || authUser.sub;
    const rows = ingredientIds.map((ingredientId: number) => ({
        user_id: userId,
        ingredient_id: ingredientId,
    }));

    const { error } = await client
        .from("user_dislike")
        .insert(rows);

    if (error) {
        throw createError({
            message: "Nem sikerült elmenteni a nem kedvelt alapanyagokat.",
        });
    }

    return true;
});