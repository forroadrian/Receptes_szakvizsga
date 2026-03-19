import {serverSupabaseClient, serverSupabaseUser} from "#supabase/server"
import { Database } from "~/types/database.types";
export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient<Database>(event);
    const user = await serverSupabaseUser(event);
    console.log(client);
    
    const body = await readBody(event)
    console.log(body);
    
    if (body.name == undefined){
        throw createError({
            status: 400,
            statusText: "Helytelen adat",
        });
    }

    const { error } = await client.from("ingredient").insert({
        name: body.name,
        category_id: 1, // ✅ Real category ID
        slug: body.name.toLowerCase().replace(/\s+/g, "-"), // Better slug
      });
    
      if (error) {
        throw createError({ statusMessage: error.message });
      }
    return true;
})