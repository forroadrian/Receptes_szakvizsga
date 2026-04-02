import { serverSupabaseClient } from "#supabase/server";
import type { Database } from "~/types/database.types";
import requireBodyKeys from "~~/server/utils/requireBodyKeys";
import { requireUser } from "~~/server/utils/requireUser";

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient<Database>(event);
    const authUser = await requireUser(event);
    const body = await readBody(event);

    requireBodyKeys(body, ["allergyId"]);

    const userId = authUser.id || authUser.sub;
    const allergyId = Number(body.allergyId);

    const { error } = await client
        .from("user_allergy")
        .delete()
        .eq("user_id", userId)
        .eq("allergy_id", allergyId);

    if (error) {
        throw createError({
            statusMessage: "Nem sikerült törölni az allergént.",
        });
    }

    return true;
});