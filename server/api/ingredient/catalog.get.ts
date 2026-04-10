import { serverSupabaseClient } from "#supabase/server"
import { requireUser } from "~~/server/utils/requireUser";

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient(event);
    await requireUser(event);

    const { data, error } = await client
        .from("ingredient")
        .select("id, name")
        .eq("is_active", true)
        .order("name");

    if (error) throw createError({ message: error.message });
    return data;
});
