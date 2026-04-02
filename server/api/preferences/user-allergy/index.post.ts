import { serverSupabaseClient } from "#supabase/server";
import type { Database } from "~/types/database.types";
import requireBodyKeys from "~~/server/utils/requireBodyKeys";
import { requireUser } from "~~/server/utils/requireUser";

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient<Database>(event);
    const authUser = await requireUser(event);
    const body = await readBody(event);

    requireBodyKeys(body, ["allergyIds"]);

    const allergyIds: number[] = Array.isArray(body.allergyIds)
        ? body.allergyIds.map((allergyId: unknown) => Number(allergyId))
        : [];

    if (!allergyIds.length) {
        throw createError({
            statusCode: 400,
            statusMessage: "Missing required field: allergyIds",
        });
    }

    const userId = authUser.id || authUser.sub;
    const rows = allergyIds.map((allergyId: number) => ({
        user_id: userId,
        allergy_id: allergyId,
    }));

    const { error } = await client
        .from("user_allergy")
        .insert(rows);

    if (error) {
        throw createError({
            statusMessage: "Nem sikerült elmenteni az allergéneket.",
        });
    }

    return true;
});