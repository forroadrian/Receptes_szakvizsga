import { serverSupabaseClient } from "#supabase/server";
import { Database } from "~/types/database.types";

export default defineEventHandler(async (event) =>{
    const client = await serverSupabaseClient<Database>(event);
    const user = await requireUser(event);

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
    .eq("user_id", user.id)

    if (error) {
        throw createError({ message: error.message });
    }

    return data
});