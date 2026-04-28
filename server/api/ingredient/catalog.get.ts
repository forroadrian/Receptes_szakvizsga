import { serverSupabaseServiceRole } from "#supabase/server"

export default defineEventHandler(async (event) => {
    setResponseHeader(event, "Cache-Control", "public, max-age=300, stale-while-revalidate=3600");
    const client = await serverSupabaseServiceRole(event);

    const { data, error } = await client
        .from("ingredient")
        .select("id, name")
        .order("name");

    if (error) throw createError({ message: error.message });
    return data;
});
