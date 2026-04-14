import { serverSupabaseClient } from "#supabase/server";
import { Database } from "~/types/database.types";
import { requireUser } from "~~/server/utils/requireUser";
import requireBodyKeys from "~~/server/utils/requireBodyKeys";

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient<Database>(event);
    const user = await requireUser(event);
    const userId = user.sub;

    const body = await readBody(event);
    requireBodyKeys(body, ["id"]);

    const { data, error } = await client
        .from("menu")
        .update({
            active: false,
            deleted_at: new Date().toISOString(),
        })
        .eq("id", body.id)
        .eq("user_id", userId)
        .select();

    if (error) {
        throw createError({ statusCode: 500, message: error.message });
    }

    if (!data || data.length === 0) {
        throw createError({ statusCode: 404, message: "Menu not found" });
    }

    return { success: true };
});
