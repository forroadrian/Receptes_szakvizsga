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

export const loadRecipeFilterCategories = async (mealOptions: Ref<Category[]>, typeOptions: Ref<Category[]>) => {
    try {
        const { formatCategory } = useCategoryFormatter()
        const data = await $fetch("/api/category", {
            method: "GET"
        });
        const categories = Array.isArray(data) ? data as Category[] : [];

        mealOptions.value = [];
        typeOptions.value = [];

        for (const category of categories) {
            const normalizedCategory: Category = {
                id: category.id,
                name: category.name,
                group_type: category.group_type ?? ""
            };
            const groupType = normalizedCategory.group_type.toLowerCase();

            if (groupType === "meal") {
                normalizedCategory.name = formatCategory(category.id)
                mealOptions.value.push(normalizedCategory);
            }

            if (groupType === "type") {
                normalizedCategory.name = formatCategory(category.id)
                typeOptions.value.push(normalizedCategory);
            }
        }
    } catch (error) {
        console.error("Hiba a kategóriák lekérése közben:", error);
    }
};