import { serverSupabaseServiceRole } from "#supabase/server"

export default defineEventHandler(async (event) => {
    setResponseHeader(event, "Cache-Control", "no-store");
    const client = await serverSupabaseServiceRole(event);

    const { data, error } = await client
        .from("ingredient")
        .select("id, name")
        .order("name");

    if (error) throw createError({ message: error.message });
    return data;
});
