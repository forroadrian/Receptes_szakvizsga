import { serverSupabaseClient } from "#supabase/server";
import { Database } from "~/types/database.types";
import { requireUser } from "~~/server/utils/requireUser";

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient<Database>(event);
    const user = await requireUser(event);
    const userId = user.sub;

    const query = getQuery(event);
    const date = query.date;

    if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        throw createError({ statusCode: 400, message: "date (YYYY-MM-DD) is required" });
    }

    const { data, error } = await client.rpc("get_missing_ingredients_for_day", {
        p_user_id: userId,
        p_day: date,
    });

    if (error) {
        throw createError({ statusCode: 500, message: error.message });
    }

    return data ?? [];
});
