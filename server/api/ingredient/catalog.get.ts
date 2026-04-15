import { serverSupabaseClient } from "#supabase/server"
import { requireUser } from "~~/server/utils/requireUser";

export default defineCachedEventHandler(async (event) => {
    const client = await serverSupabaseClient(event);

    const { data, error } = await client
        .from("ingredient")
        .select("id, name")
        .eq("is_active", true)
        .order("name");
    
    if (error) throw createError({ message: error.message });
    return data;
},{maxAge: 60*60*24});
