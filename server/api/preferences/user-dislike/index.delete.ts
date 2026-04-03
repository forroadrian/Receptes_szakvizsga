import { serverSupabaseClient } from "#supabase/server";
import type { Database } from "~/types/database.types";
import requireBodyKeys from "~~/server/utils/requireBodyKeys";
import { requireUser } from "~~/server/utils/requireUser";

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient<Database>(event);
    const authUser = await requireUser(event);
    const body = await readBody(event);

    requireBodyKeys(body, ["ingredientId"]);

    const userId = authUser.id || authUser.sub;
    const ingredientId = Number(body.ingredientId);

    const { error } = await client
        .from("user_dislike")
        .delete()
        .eq("user_id", userId)
        .eq("ingredient_id", ingredientId);

    if (error) {
        throw createError({
            message: "Nem sikerült törölni a nem kedvelt alapanyagot.",
        });
    }

    return true;
});