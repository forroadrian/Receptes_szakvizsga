import { serverSupabaseServiceRole } from "#supabase/server";
import type { Database } from "~/types/database.types";

export default defineEventHandler(async (event) => {
    const admin = await serverSupabaseServiceRole<Database>(event);

    const { data: categories, error: catErr } = await admin
        .from("category")
        .select("id, name, parent_id")
        .eq("group_type", "ingredient_type")
        .order("name", { ascending: true });

    if (catErr) throw createError({ message: catErr.message });

    const categoryIds = (categories ?? []).map((c) => c.id);

    if (categoryIds.length === 0) {
        return { categories: [], links: [] };
    }

    const { data: links, error: linkErr } = await admin
        .from("ingredient_category")
        .select("category_id, ingredient_id, ingredient:ingredient_id(name)")
        .in("category_id", categoryIds);

    if (linkErr) throw createError({ message: linkErr.message });

    const flatLinks = (links ?? []).map((l) => ({
        category_id: l.category_id,
        ingredient_id: l.ingredient_id,
        ingredient_name: (l.ingredient as { name: string } | null)?.name ?? "",
    })).sort((a, b) => a.ingredient_name.localeCompare(b.ingredient_name));

    return {
        categories: categories ?? [],
        links: flatLinks,
    };
});
