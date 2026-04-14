import {serverSupabaseClient} from "#supabase/server"

export default eventHandler(async (event) => {
    const client = await serverSupabaseClient(event);
    const user = await requireUser(event);

    const body = await readBody(event);
    requireBodyKeys(body, ["id"]);

    const {error} = await client
        .from("user_ingredient")
        .delete()
        .eq("ingredient_id", body.id)
        .eq("user_id", user.id);

    if(error) {
        throw createError({ message: error.message });
    }
    return true;
});