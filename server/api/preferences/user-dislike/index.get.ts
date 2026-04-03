import { serverSupabaseClient } from "#supabase/server";
import type { Database } from "~/types/database.types";
import { requireUser } from "~~/server/utils/requireUser";

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient<Database>(event);
    const authUser = await requireUser(event);

    const userId = authUser.id || authUser.sub;

    const { data, error } = await client
        .from("user_dislike")
        .select("ingredient_id")
        .eq("user_id", userId);

    if (error) {
        throw createError({
            message: "Nem sikerült betölteni a nem kedvelt alapanyagokat.",
        });
    }

    return data || [];
});