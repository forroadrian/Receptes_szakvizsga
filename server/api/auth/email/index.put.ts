import { serverSupabaseClient } from "#supabase/server";
import type { Database } from "~/types/database.types";
import requireBodyKeys from "~~/server/utils/requireBodyKeys";
import { requireUser } from "~~/server/utils/requireUser";

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient<Database>(event);
    const authUser = await requireUser(event);
    const body = await readBody(event);

    requireBodyKeys(body, ["currentEmail", "newEmail"]);

    const userId = authUser.id || authUser.sub;
    const loggedInEmail = authUser.email?.trim().toLowerCase() || "";
    const currentEmail = String(body.currentEmail).trim().toLowerCase();
    const newEmail = String(body.newEmail).trim().toLowerCase();

    if (!loggedInEmail) {
        throw createError({
            statusCode: 400,
            statusMessage: "Nem található a jelenlegi email cím.",
        });
    }

    if (currentEmail !== loggedInEmail) {
        throw createError({
            statusCode: 400,
            statusMessage: "A jelenlegi email cím nem egyezik a bejelentkezett email címmel.",
        });
    }

    if (newEmail === loggedInEmail) {
        throw createError({
            statusCode: 400,
            statusMessage: "Az új email cím megegyezik a régivel.",
        });
    }

    const { data, error } = await client
        .from("user")
        .select("id")
        .eq("email", newEmail)
        .neq("id", userId)
        .limit(1)
        .maybeSingle();

    if (error) {
        throw createError({
            statusCode: 500,
            statusMessage: "Nem sikerült ellenőrizni az email címet.",
        });
    }

    if (data) {
        throw createError({
            statusCode: 409,
            statusMessage: "Ezzel az email címmel már regisztráltak.",
        });
    }

    return { newEmail };
});