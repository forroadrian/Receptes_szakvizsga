import { serverSupabaseClient } from "#supabase/server";
import { Database } from "~/types/database.types";
import { requireUser } from "~~/server/utils/requireUser";

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient<Database>(event);
    const user = await requireUser(event);
    const userId = user.sub;

    const { data, error } = await client
        .from("menu")
        .select(`
            *,
            menu_recipe (
                recipe_id,
                recipe (
                    id,
                    name,
                    description,
                    time,
                    servings,
                    author_id
                )
            )
        `)
        .eq("active", true)
        .eq("user_id", userId);

    if (error) {
        throw createError({ statusCode: 500, message: error.message });
    }

    return data;
});
