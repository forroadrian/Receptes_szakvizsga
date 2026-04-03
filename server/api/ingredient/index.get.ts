import {serverSupabaseClient} from "#supabase/server"
export default defineEventHandler(async (event) =>{
    const client = await serverSupabaseClient(event);
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
    .eq("user_id",user.sub)

    if (error) {
        throw createError({ message: error.message });
    }

    return data
});