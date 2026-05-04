type CategoryLike = { id?: number | null; name?: string | null; group_type?: string | null }
type RecipeLike = {
    categories?: CategoryLike[] | null;
    image_url?: string | null;
}

const CATEGORY_IMAGE_BY_ID: Record<number, string> = {
    2: '/icons/categories/reggeli.svg',
    3: '/icons/categories/ebed.svg',
    4: '/icons/categories/vacsora.svg',
    5: '/icons/categories/snack.svg',
    6: '/icons/categories/foetel.svg',
    7: '/icons/categories/eloetel.svg',
    8: '/icons/categories/desszert.svg',
    9: '/icons/categories/sos.svg',
    10: '/icons/categories/edes.svg',
    11: '/icons/categories/gyors.svg',
    12: '/icons/categories/idoigenyes.svg',
    13: '/icons/categories/csipos.svg'
}

const CATEGORY_IMAGE_BY_NAME: Record<string, string> = {
    'Reggeli': '/icons/categories/reggeli.svg',
    'Breakfast': '/icons/categories/reggeli.svg',
    'Ebéd': '/icons/categories/ebed.svg',
    'Dinner': '/icons/categories/ebed.svg',
    'Vacsora': '/icons/categories/vacsora.svg',
    'Supper': '/icons/categories/vacsora.svg',
    'Snack': '/icons/categories/snack.svg',
    'Főétel': '/icons/categories/foetel.svg',
    'Main course': '/icons/categories/foetel.svg',
    'Előétel': '/icons/categories/eloetel.svg',
    'Appetizer': '/icons/categories/eloetel.svg',
    'Desszert': '/icons/categories/desszert.svg',
    'Dessert': '/icons/categories/desszert.svg',
    'Sós': '/icons/categories/sos.svg',
    'Savory': '/icons/categories/sos.svg',
    'Édes': '/icons/categories/edes.svg',
    'Sweet': '/icons/categories/edes.svg',
    'Gyors': '/icons/categories/gyors.svg',
    'Quick': '/icons/categories/gyors.svg',
    'Időigényes': '/icons/categories/idoigenyes.svg',
    'Time-consuming': '/icons/categories/idoigenyes.svg',
    'Csípős': '/icons/categories/csipos.svg',
    'Spicy': '/icons/categories/csipos.svg'
}

const DEFAULT_RECIPE_IMAGE = '/icons/categories/foetel.svg'

const resolveCategoryImage = (category: CategoryLike): string | null => {
    if (typeof category.id === 'number' && CATEGORY_IMAGE_BY_ID[category.id]) {
        return CATEGORY_IMAGE_BY_ID[category.id]!
    }
    if (category.name && CATEGORY_IMAGE_BY_NAME[category.name]) {
        return CATEGORY_IMAGE_BY_NAME[category.name]!
    }
    return null
}

const pickCategoryImage = (categories: CategoryLike[]): string => {
    const typed = categories.find(c => c.group_type === 'type' && resolveCategoryImage(c))
    if (typed) return resolveCategoryImage(typed)!

    const meal = categories.find(c => c.group_type === 'meal' && resolveCategoryImage(c))
    if (meal) return resolveCategoryImage(meal)!

    for (const c of categories) {
        const img = resolveCategoryImage(c)
        if (img) return img
    }
    return DEFAULT_RECIPE_IMAGE
}

export const useRecipeImage = () => {
    const getRecipeImage = (recipe: RecipeLike | null | undefined): string => {
        if (recipe?.image_url && recipe.image_url.trim() !== '') {
            return recipe.image_url
        }

        const categories = recipe?.categories ?? []
        if (!categories.length) return DEFAULT_RECIPE_IMAGE
        return pickCategoryImage(categories)
    }

    return { getRecipeImage }
}
