import { serverSupabaseClient } from "#supabase/server";
import type { Database } from "~/types/database.types";
import requireBodyKeys from "~~/server/utils/requireBodyKeys";

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient<Database>(event);
    const body = await readBody(event);

    requireBodyKeys(body, ["loginValue"]);

    const loginValue = String(body.loginValue).trim();

    if (loginValue.includes("@")) {
        return { email: loginValue };
    }

    const { data, error } = await client
        .from("user")
        .select("email")
        .eq("username", loginValue)
        .maybeSingle();

    if (error || !data) {
        throw createError({
            statusCode: 404,
            statusMessage: "Nem létezik ilyen felhasználónév.",
        });
    }

    return data;
});