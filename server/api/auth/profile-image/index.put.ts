import { serverSupabaseClient } from "#supabase/server";
import type { Database } from "~/types/database.types";
import requireBodyKeys from "~~/server/utils/requireBodyKeys";
import { requireUser } from "~~/server/utils/requireUser";

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient<Database>(event);
    const authUser = await requireUser(event);
    const body = await readBody(event);

    requireBodyKeys(body, ["profileUrl"]);

    const userId = authUser.id || authUser.sub;
    const profileUrl = String(body.profileUrl);

    const { error } = await client
        .from("user")
        .update({ profile_url: profileUrl })
        .eq("id", userId);

    if (error) {
        throw createError({ message: "Nem sikerült menteni a profilképet." });
    }

    return { profileUrl };
});