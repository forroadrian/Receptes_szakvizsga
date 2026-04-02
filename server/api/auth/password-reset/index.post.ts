import { serverSupabaseClient } from "#supabase/server";
import type { Database } from "~/types/database.types";
import requireBodyKeys from "~~/server/utils/requireBodyKeys";

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient<Database>(event);
    const body = await readBody(event);

    requireBodyKeys(body, ["email"]);

    const email = String(body.email).trim().toLowerCase();

    const { data, error } = await client
        .from("user")
        .select("id")
        .eq("email", email)
        .maybeSingle();

    if (error) {
        throw createError({
            statusCode: 500,
            statusMessage: "Nem sikerült ellenőrizni az email címet.",
        });
    }

    if (!data) {
        throw createError({
            statusCode: 404,
            statusMessage: "Nincs ilyen email címmel regisztrált felhasználó.",
        });
    }

    return { email };
});