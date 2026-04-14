import {serverSupabaseClient, serverSupabaseServiceRole} from "#supabase/server"
import { Database } from "~/types/database.types";
import requireBodyKeys from "~~/server/utils/requireBodyKeys";
import { requireUser } from "~~/server/utils/requireUser";
export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient<Database>(event);
    const admin = await serverSupabaseServiceRole(event);
    const user = await requireUser(event);

    const body = await readBody(event);
    requireBodyKeys(body, ["name","unit","quantity","expiry","prev"])
    console.log(body);
    let ingredientId
    const {data, error} = await client.from("ingredient")
        .select("id")
        .eq("name",body.name)
        .maybeSingle()
    ingredientId = data?.id
    if (!ingredientId) {
        console.log("Hozzáadás");
        
        const {data} = await admin.from("ingredient")
            .insert({
                name: body.name,
            })
            .select("id")
            .single()
        ingredientId = data?.id
    }
    
    const { data: updated, error: resp_err } = await client.from("user_ingredient")
        .update({
            ingredient_id: ingredientId,
            unit: body.unit,
            quantity: body.quantity,
            expiry_date: body.expiry
        })
        .eq("ingredient_id", body?.prev)
        .eq("user_id", user.id)
        .select()
        .single()

    if (resp_err) {
        throw createError({ statusCode: 500, message: resp_err.message });
    }

    return updated;
});