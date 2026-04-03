import { serverSupabaseClient } from "#supabase/server";
import type { Database } from "~/types/database.types";

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient<Database>(event);

    const { data, error } = await client
        .from("ingredient")
        .select("id, name, created_at, last_used_at, is_active, deleted_at")
        .eq("is_active", true)
        .is("deleted_at", null)
        .order("name", { ascending: true });

    if (error) {
        throw createError({
            message: "Nem sikerült betölteni az alapanyagokat.",
        });
    }

    return data || [];
});