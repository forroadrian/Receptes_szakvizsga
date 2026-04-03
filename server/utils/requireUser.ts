import { serverSupabaseUser } from "#supabase/server";
export async function requireUser(event: any) {
    const user = await serverSupabaseUser(event);
    if (!user) {
        throw createError({ statusCode: 401, message: "Unauthorized" });
    }
    return user;
}