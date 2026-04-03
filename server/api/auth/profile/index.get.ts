import { serverSupabaseClient } from "#supabase/server";
import type { Database } from "~/types/database.types";
import { requireUser } from "~~/server/utils/requireUser";

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient<Database>(event);
    const authUser = await requireUser(event);

    const userId = authUser.id || authUser.sub;

    const { data, error } = await client
        .from("user")
        .select("username, email, profile_url")
        .eq("id", userId)
        .single();

    if (error) {
        throw createError({ message: error.message });
    }

    if (authUser.email && data.email !== authUser.email) {
        const { error: emailSyncError } = await client
            .from("user")
            .update({ email: authUser.email })
            .eq("id", userId);

        if (!emailSyncError) {
            data.email = authUser.email;
        }
    }

    return data;
});