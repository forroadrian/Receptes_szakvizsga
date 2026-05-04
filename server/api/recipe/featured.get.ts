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

type RankingRow = {
    id: number;
    name: string;
    likes: number;
    saves: number;
    author_id: string | null;
};

export default defineEventHandler(async (event): Promise<FeaturedRecipe[]> => {
    const admin = await serverSupabaseServiceRole<Database>(event);

    const { data: ranking, error: rankError } = await admin
        .from("recipe")
        .select("id, name, likes, saves, author_id")
        .eq("active", true)
        .is("deleted_at", null);

    if (rankError) {
        throw createError({ statusCode: 500, message: rankError.message });
    }

    const allRecipes = (ranking ?? []) as RankingRow[];

    const sortedByEngagement = [...allRecipes].sort((a, b) => {
        const engagementA = a.likes + a.saves;
        const engagementB = b.likes + b.saves;
        if (engagementA !== engagementB) {
            return engagementB - engagementA;
        }
        return a.name.localeCompare(b.name, "hu");
    });

    const topThreeByEngagement = sortedByEngagement.slice(0, 3);
    const leader = topThreeByEngagement[0];
    const leaderHasAnyEngagement = leader !== undefined && (leader.likes + leader.saves) > 0;

    let topIds: number[];
    if (leaderHasAnyEngagement) {
        topIds = topThreeByEngagement.map(recipe => recipe.id);
    } else {
        const adminRecipes = allRecipes.filter(recipe => recipe.author_id === null);
        const adminRecipesByName = [...adminRecipes].sort((a, b) =>
            a.name.localeCompare(b.name, "hu")
        );
        topIds = adminRecipesByName.slice(0, 3).map(recipe => recipe.id);
    }

    if (topIds.length === 0) return [];

    const { data, error } = await admin
        .from("recipe")
        .select(featuredSelect)
        .in("id", topIds);

    if (error) {
        throw createError({ statusCode: 500, message: error.message });
    }

    const fullRows = (data ?? []) as unknown as FeaturedRow[];

    const fullRowById = new Map(fullRows.map(row => [row.id, row]));
    const orderedRows: FeaturedRow[] = [];
    for (const id of topIds) {
        const row = fullRowById.get(id);
        if (row) orderedRows.push(row);
    }

    return orderedRows.map(shape);
});
