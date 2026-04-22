import { serverSupabaseClient } from "#supabase/server";
import { Database } from "~/types/database.types";
import { requireUser } from "~~/server/utils/requireUser";

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient<Database>(event);
    const user = await requireUser(event);
    const userId = user.sub;

    const query = getQuery(event);
    const from = query.from;
    const to = query.to;

    const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (typeof from !== "string" || !isoDateRegex.test(from) ||
        typeof to !== "string" || !isoDateRegex.test(to)) {
        throw createError({
            statusCode: 400,
            message: "from and to (YYYY-MM-DD) are required",
        });
    }

    const { data, error } = await client.rpc(
        "get_missing_ingredient_counts_for_range",
        { p_user_id: userId, p_from: from, p_to: to }
    );

    if (error) {
        throw createError({ statusCode: 500, message: error.message });
    }

    return data ?? [];
});
