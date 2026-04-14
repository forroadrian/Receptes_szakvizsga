import { serverSupabaseClient } from "#supabase/server";
import { Database } from "~/types/database.types";
import { requireUser } from "~~/server/utils/requireUser";
import requireBodyKeys from "~~/server/utils/requireBodyKeys";

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient<Database>(event);
    const user = await requireUser(event);

    const body = await readBody(event);
    requireBodyKeys(body, ["id"]);

    if (!body.name && !body.date) {
        throw createError({ statusCode: 400, message: "At least one of name or date must be provided" });
    }

    const updates: { name?: string; planned_date?: string } = {};
    if (body.name) updates.name = body.name;
    if (body.date) updates.planned_date = body.date;

    const { data, error } = await client
        .from("menu")
        .update(updates)
        .eq("id", body.id)
        .eq("user_id", user.id)
        .select()
        .maybeSingle();

    if (error) {
        throw createError({ statusCode: 500, message: error.message });
    }

    if (!data) {
        throw createError({ statusCode: 404, message: "Menu not found" });
    }

    return data;
});
