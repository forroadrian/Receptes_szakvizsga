import { serverSupabaseClient } from "#supabase/server";
import { Database } from "~/types/database.types";
import requireBodyKeys from "~~/server/utils/requireBodyKeys";
import { requireUser } from "~~/server/utils/requireUser";

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient<Database>(event);
    const user = await requireUser(event);

    const body = await readBody(event);
    requireBodyKeys(body, ["prev", "ingredient_id", "unit", "quantity", "expiry"]);

    const { data, error } = await client
        .from("user_ingredient")
        .update({
            ingredient_id: body.ingredient_id,
            unit: body.unit,
            quantity: body.quantity,
            expiry_date: body.expiry,
        })
        .eq("ingredient_id", body.prev)
        .eq("user_id", user.id)
        .select()
        .single();

    if (error) {
        throw createError({ statusCode: 500, message: error.message });
    }

    return data;
});
