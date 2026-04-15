import { serverSupabaseClient } from "#supabase/server";
import { Database } from "~/types/database.types";
import { requireUser } from "~~/server/utils/requireUser";

export default defineEventHandler(async (event) =>{
    const client = await serverSupabaseClient<Database>(event);
    const user = await requireUser(event);
    const userId = user.sub;

    const {data, error} = await client
    .from("user_ingredient")
    .select(`
        quantity,
        unit,
        expiry_date,
        ingredient:ingredient_id!inner (
            id,
            name
        )
    `)
    .eq("user_id", userId)

    if (error) {
        throw createError({ message: error.message });
    }

    return data
});