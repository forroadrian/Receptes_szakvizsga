import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { toBudapestDateKey } from "~/utils/budapestDate";

export type MenuRecipe = {
    recipe_id: number;
    name: string;
    description: string;
    time: number;
    servings: number;
    author_id: string | null;
};

export type MenuItem = {
    id: number;
    user_id: string;
    name: string | null;
    planned_date: string;
    active: boolean;
    recipes: MenuRecipe[];
};

type MenuApiResponse = {
    id: number;
    user_id: string;
    name: string | null;
    planned_date: string | null;
    active: boolean;
    deleted_at: string | null;
    menu_recipe: {
        recipe_id: number;
        recipe: {
            id: number;
            name: string;
            description: string;
            time: number;
            servings: number;
            author_id: string | null;
        } | null;
    }[];
};

type CreatedMenuResponse = {
    id: number;
    user_id: string;
    name: string | null;
    planned_date: string;
    active: boolean;
};

export const useMenuStore = defineStore("menus", () => {
    const menus = ref<MenuItem[]>([]);
    const isLoaded = ref(false);

    const menusByDate = computed(() => {
        const map = new Map<string, MenuItem[]>();
        for (const menu of menus.value) {
            const key = toBudapestDateKey(menu.planned_date);
            const bucket = map.get(key) ?? [];
            bucket.push(menu);
            map.set(key, bucket);
        }
        return map;
    });

    const getMenusForDate = (dateKey: string): MenuItem[] => {
        return menusByDate.value.get(dateKey) ?? [];
    };

    const getMenusInMonth = (year: number, monthZeroIndexed: number): MenuItem[] => {
        const monthKey = `${year}-${String(monthZeroIndexed + 1).padStart(2, "0")}`;
        return menus.value.filter((m) => toBudapestDateKey(m.planned_date).startsWith(monthKey));
    };

    const nextUpcoming = computed<MenuItem | null>(() => {
        const now = Date.now();
        let best: MenuItem | null = null;
        for (const menu of menus.value) {
            const t = new Date(menu.planned_date).getTime();
            if (t < now) continue;
            if (!best || t < new Date(best.planned_date).getTime()) {
                best = menu;
            }
        }
        return best;
    });

    const upcomingWithinDays = (days: number): MenuItem[] => {
        const now = Date.now();
        const cutoff = now + days * 86_400_000;
        return menus.value
            .filter((m) => {
                const t = new Date(m.planned_date).getTime();
                return t >= now && t <= cutoff;
            })
            .sort(
                (a, b) =>
                    new Date(a.planned_date).getTime() - new Date(b.planned_date).getTime()
            );
    };

    const loadMenus = async () => {
        const raw = await $fetch<MenuApiResponse[]>("/api/menu", { method: "GET" });
        menus.value = (raw ?? [])
            .filter((m): m is MenuApiResponse & { planned_date: string } => !!m.planned_date)
            .map<MenuItem>((m) => ({
                id: m.id,
                user_id: m.user_id,
                name: m.name,
                planned_date: m.planned_date,
                active: m.active,
                recipes: (m.menu_recipe ?? [])
                    .filter((mr) => !!mr.recipe)
                    .map<MenuRecipe>((mr) => ({
                        recipe_id: mr.recipe_id,
                        name: mr.recipe!.name,
                        description: mr.recipe!.description,
                        time: mr.recipe!.time,
                        servings: mr.recipe!.servings,
                        author_id: mr.recipe!.author_id,
                    })),
            }));
        isLoaded.value = true;
    };

    const createMenu = async (
        date: string,
        name: string,
        recipeIds: number[]
    ): Promise<MenuItem | null> => {
        const created = await $fetch<CreatedMenuResponse>("/api/menu", {
            method: "POST",
            body: { name, date, recipe_ids: recipeIds },
        });
        await loadMenus();
        return menus.value.find((m) => m.id === created.id) ?? null;
    };

    const updateMenu = async (id: number, updates: { name?: string; date?: string }) => {
        await $fetch("/api/menu", { method: "PUT", body: { id, ...updates } });
        await loadMenus();
    };

    const deleteMenu = async (id: number) => {
        await $fetch("/api/menu", { method: "DELETE", body: { id } });
        menus.value = menus.value.filter((m) => m.id !== id);
    };

    const addRecipeToMenu = async (menuId: number, recipeId: number) => {
        await $fetch("/api/menu/recipe", {
            method: "POST",
            body: { menu_id: menuId, recipe_id: recipeId },
        });
        await loadMenus();
    };

    const removeRecipeFromMenu = async (menuId: number, recipeId: number) => {
        await $fetch("/api/menu/recipe", {
            method: "DELETE",
            body: { menu_id: menuId, recipe_id: recipeId },
        });
        await loadMenus();
    };

    return {
        menus,
        isLoaded,
        menusByDate,
        nextUpcoming,
        getMenusForDate,
        getMenusInMonth,
        upcomingWithinDays,
        loadMenus,
        createMenu,
        updateMenu,
        deleteMenu,
        addRecipeToMenu,
        removeRecipeFromMenu,
    };
});
