import { serverSupabaseClient } from "#supabase/server";
import { Database } from "~/types/database.types";
import { requireUser } from "~~/server/utils/requireUser";
import requireBodyKeys from "~~/server/utils/requireBodyKeys";

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient<Database>(event);
    await requireUser(event);

    const body = await readBody(event);
    requireBodyKeys(body, ["id"]);

    const { error } = await client
        .from("menu")
        .update({
            active: false,
            deleted_at: new Date().toISOString(),
        })
        .eq("id", body.id);

    if (error) {
        throw createError({ statusCode: 500, message: error.message });
    }

    return { success: true };
});
