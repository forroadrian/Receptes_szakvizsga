import {serverSupabaseClient} from '#supabase/server';
import { Database } from "~/types/database.types";
export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient<Database>(event);

    const {data, error} = await client.rpc("get_recommended_ingredients");
    if (error) {
        throw createError({
            message: error.message,
            statusCode: 400,
        })
    }

    if(data.length == 0) {
        setResponseStatus(event, 204, "No content");
        return "No content"
    }
    return data;
})