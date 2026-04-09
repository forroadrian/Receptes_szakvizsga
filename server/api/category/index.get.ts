import { serverSupabaseServiceRole } from "#supabase/server";
import { Database } from "~/types/database.types";

export default defineEventHandler(async (event) => {
    const admin = await serverSupabaseServiceRole<Database>(event);

    const { data, error } = await admin
        .from("category")
        .select("id, name, group_type")
        .order("name", { ascending: true });

    if (error) {
        throw createError({ message: error.message });
    }

    return data;
});