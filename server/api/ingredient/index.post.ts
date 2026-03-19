import {serverSupabaseClient, serverSupabaseServiceRole} from "#supabase/server"
import { Database } from "~/types/database.types";
import requireBodyKeys from "~~/server/utils/requireBodyKeys";
import { requireUser } from "~~/server/utils/requireUser";
import toSlug from "~~/server/utils/toSlug";
export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient<Database>(event);
    const admin = await serverSupabaseServiceRole(event);
    const user = await requireUser(event);

    const body = await readBody(event);
    requireBodyKeys(body, ["name","unit","quantity","expiry"])

    const slug = toSlug(body.name);
    let ingredientId = -1

    const {data: ingredientData, error: ingredientError} = await client
        .from("ingredient")
        .select("id")
        .eq("slug",slug)
        .maybeSingle()

    if (ingredientError) {
        throw createError({
            "statusMessage": ingredientError.message
        })
    }

    if(!ingredientError) {
        if(ingredientData != undefined){
            ingredientId = ingredientData?.id as number
        }
    }

    if (ingredientId === -1) {
        const { error, data } = await admin
        .from("ingredient")
        .insert({
            name: body.name,
            slug: slug, 
        })
        .select()
        .single();
        
        if (error) {
            throw createError({ statusMessage: error.message });
        }

        if(data){
            ingredientId = data.id
        }
    }

    const {data: connectionTableData, error: connectionTableError} = await client
        .from("user_ingredient")
        .insert({
            "user_id": user.sub,
            "ingredient_id": ingredientId,
            "unit": body.unit,
            "quantity": body.quantity,
            "expiry_date": body.expiry
        })
        .select()
        .maybeSingle()

    if (connectionTableError) {
        throw createError({ statusMessage: connectionTableError.message });
    }

    if(connectionTableData){
        console.log(JSON.stringify(connectionTableData));
        
    }
})