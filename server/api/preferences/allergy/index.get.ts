import { serverSupabaseClient } from "#supabase/server";
import type { Database } from "~/types/database.types";

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient<Database>(event);

    const { data, error } = await client
        .from("allergy")
        .select("id, name")
        .order("name", { ascending: true });

    if (error) {
        throw createError({
            message: "Nem sikerült betölteni az allergéneket.",
        });
    }

    return data || [];
});