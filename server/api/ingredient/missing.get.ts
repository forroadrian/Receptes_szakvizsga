import {serverSupabaseClient} from '#supabase/server';
import { Database } from "~/types/database.types";
import { requireUser } from "~~/server/utils/requireUser";
export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient<Database>(event);
    const user = await requireUser(event);
    const userId = user.sub;

    const {data, error} = await client.rpc("get_recommended_ingredients", {
        p_user_id: userId
    });
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