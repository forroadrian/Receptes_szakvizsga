import { serverSupabaseServiceRole } from "#supabase/server";
import { Database } from "~/types/database.types";

const featuredSelect = `
    id, author_id, name, description, saves, likes, time, servings,
    recipe_ingredients (
        ingredient (
            ingredient_allergy (
                allergy (
                    id,
                    name
                )
            )
        )
    ),
    recipe_categories (
        category (
            id,
            name,
            group_type
        )
    )
`;

type FeaturedRow = {
    id: number;
    author_id: string | null;
    name: string;
    description: string;
    saves: number;
    likes: number;
    time: number;
    servings: number;
    recipe_ingredients: Array<{
        ingredient: {
            ingredient_allergy: Array<{
                allergy: { id: number; name: string } | null;
            }> | null;
        } | null;
    }> | null;
    recipe_categories: Array<{
        category: { id: number; name: string; group_type: string | null } | null;
    }> | null;
};

type FeaturedRecipe = {
    id: number;
    name: string;
    description: string;
    likes: number;
    saves: number;
    time: number;
    servings: number;
    categories: Array<{ id: number; name: string; group_type: string }>;
    allergies: Array<{ id: number; name: string }>;
};

const shape = (row: FeaturedRow): FeaturedRecipe => {
    const seenAllergyIds = new Set<number>();
    const allergies: FeaturedRecipe["allergies"] = [];

    for (const ri of row.recipe_ingredients ?? []) {
        for (const ia of ri.ingredient?.ingredient_allergy ?? []) {
            const a = ia.allergy;
            if (a && !seenAllergyIds.has(a.id)) {
                seenAllergyIds.add(a.id);
                allergies.push({ id: a.id, name: a.name });
            }
        }
    }

    const categories: FeaturedRecipe["categories"] = [];
    for (const rc of row.recipe_categories ?? []) {
        if (rc.category) {
            categories.push({
                id: rc.category.id,
                name: rc.category.name,
                group_type: rc.category.group_type ?? ""
            });
        }
    }

    return {
        id: row.id,
        name: row.name,
        description: row.description,
        likes: row.likes,
        saves: row.saves,
        time: row.time,
        servings: row.servings,
        categories,
        allergies
    };
};

export default defineEventHandler(async (event): Promise<FeaturedRecipe[]> => {
    const admin = await serverSupabaseServiceRole<Database>(event);

    const { data, error } = await admin
        .from("recipe")
        .select(featuredSelect)
        .eq("active", true)
        .is("deleted_at", null);

    if (error) {
        throw createError({ statusCode: 500, message: error.message });
    }

    const rows = (data ?? []) as unknown as FeaturedRow[];

    const sorted = [...rows].sort((a, b) => {
        const engagementDiff = b.likes + b.saves - (a.likes + a.saves);
        if (engagementDiff !== 0) return engagementDiff;
        return a.name.localeCompare(b.name, "hu");
    });

    const topByEngagement = sorted.slice(0, 3);
    const leadHasEngagement =
        topByEngagement.length > 0 &&
        topByEngagement[0]!.likes + topByEngagement[0]!.saves > 0;

    if (leadHasEngagement) {
        return topByEngagement.map(shape);
    }

    const adminFallback = rows
        .filter(r => r.author_id === null)
        .sort((a, b) => a.name.localeCompare(b.name, "hu"))
        .slice(0, 3);

    return adminFallback.map(shape);
});
