import type Category from "~/interfaces/Category";

export const hasCategory = (categories: Category[], categoryId: number | null) => {
    if (categoryId === null) {
        return true;
    }

    if (!categories || categories.length === 0) {
        return false;
    }

    for (const category of categories) {
        if (category.id === categoryId) {
            return true;
        }
    }

    return false;
};

export const loadRecipeFilterCategories = async (mealOptions: Ref<Category[]>,typeOptions: Ref<Category[]>) => {
    try {
        const data = await $fetch("/api/category", {
            method: "GET"
        });
        const categories = Array.isArray(data) ? data as Category[] : [];

        mealOptions.value = [];
        typeOptions.value = [];

        for (const category of categories) {
            const groupType = String(category.group_type).toLowerCase();

            if (groupType === "meal") {
                mealOptions.value.push(category);
            }

            if (groupType === "type") {
                typeOptions.value.push(category);
            }
        }
    } catch (error) {
        console.error("Hiba a kategóriák lekérése közben:", error);
    }
};