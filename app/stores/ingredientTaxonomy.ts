import { defineStore } from "pinia";

export interface TaxonomyCategory {
    id: number;
    name: string | null;
    parent_id: number | null;
}

export interface TaxonomyLink {
    category_id: number;
    ingredient_id: number;
    ingredient_name: string;
}

export interface TaxonomyTreeNode {
    kind: "category";
    id: number;
    slug: string;
    children: TaxonomyTreeNode[];
    ingredients: TaxonomyIngredientNode[];
}

export interface TaxonomyIngredientNode {
    kind: "ingredient";
    id: number;
    name: string;
}

export const useIngredientTaxonomyStore = defineStore("ingredientTaxonomy", () => {
    const categories = ref<TaxonomyCategory[]>([]);
    const links = ref<TaxonomyLink[]>([]);
    const loaded = ref(false);
    const loading = ref(false);

    const load = async (force = false) => {
        if (loading.value) return;
        if (loaded.value && !force) return;
        loading.value = true;
        try {
            const res = await $fetch<{ categories: TaxonomyCategory[]; links: TaxonomyLink[] }>(
                "/api/category/ingredient-tree",
                { method: "GET" }
            );
            categories.value = res.categories;
            links.value = res.links;
            loaded.value = true;
        } finally {
            loading.value = false;
        }
    };

    const tree = computed<TaxonomyTreeNode[]>(() => {
        const byParent = new Map<number | null, TaxonomyCategory[]>();
        const depthByCategory = new Map<number, number>();
        for (const cat of categories.value) {
            const list = byParent.get(cat.parent_id) ?? [];
            list.push(cat);
            byParent.set(cat.parent_id, list);
        }

        const computeDepth = (catId: number): number => {
            const cached = depthByCategory.get(catId);
            if (cached !== undefined) return cached;
            const cat = categories.value.find((c) => c.id === catId);
            if (!cat) return 0;
            const d = cat.parent_id === null ? 0 : computeDepth(cat.parent_id) + 1;
            depthByCategory.set(catId, d);
            return d;
        };

        const bestLinkByIngredient = new Map<number, TaxonomyLink>();
        for (const link of links.value) {
            const current = bestLinkByIngredient.get(link.ingredient_id);
            if (!current) {
                bestLinkByIngredient.set(link.ingredient_id, link);
                continue;
            }
            const dNew = computeDepth(link.category_id);
            const dCur = computeDepth(current.category_id);
            if (dNew > dCur || (dNew === dCur && link.category_id < current.category_id)) {
                bestLinkByIngredient.set(link.ingredient_id, link);
            }
        }

        const ingredientsByCategory = new Map<number, TaxonomyIngredientNode[]>();
        for (const link of bestLinkByIngredient.values()) {
            const list = ingredientsByCategory.get(link.category_id) ?? [];
            list.push({ kind: "ingredient", id: link.ingredient_id, name: link.ingredient_name });
            ingredientsByCategory.set(link.category_id, list);
        }

        const buildNode = (cat: TaxonomyCategory): TaxonomyTreeNode => ({
            kind: "category",
            id: cat.id,
            slug: cat.name ?? "",
            children: (byParent.get(cat.id) ?? []).map(buildNode),
            ingredients: ingredientsByCategory.get(cat.id) ?? [],
        });

        return (byParent.get(null) ?? []).map(buildNode);
    });

    return {
        categories,
        links,
        loaded,
        loading,
        tree,
        load,
    };
});
