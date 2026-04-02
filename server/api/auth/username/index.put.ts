import { serverSupabaseClient } from "#supabase/server";
import type { Database } from "~/types/database.types";
import requireBodyKeys from "~~/server/utils/requireBodyKeys";
import { requireUser } from "~~/server/utils/requireUser";

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient<Database>(event);
    const authUser = await requireUser(event);
    const body = await readBody(event);

    requireBodyKeys(body, ["username"]);

    const userId = authUser.id || authUser.sub;
    const username = String(body.username).trim();

    const { data: existingUsernameUser, error: usernameCheckError } = await client
        .from("user")
        .select("id")
        .eq("username", username)
        .neq("id", userId)
        .limit(1)
        .maybeSingle();

    if (usernameCheckError) {
        throw createError({
            statusCode: 500,
            statusMessage: "Nem sikerült ellenőrizni a felhasználónevet.",
        });
    }

    if (existingUsernameUser) {
        throw createError({
            statusCode: 409,
            statusMessage: "Ez a felhasználónév már foglalt.",
        });
    }

    const { error } = await client
        .from("user")
        .update({ username })
        .eq("id", userId);

    if (error) {
        throw createError({
            statusCode: 500,
            statusMessage: "Nem sikerült frissíteni a felhasználónevet az adatbázisban.",
        });
    }

    return { username };
});