type CategoryLike = { name?: string | null; group_type?: string | null }
type RecipeLike = { categories?: CategoryLike[] | null }

const CATEGORY_IMAGE_MAP: Record<string, string> = {
    'Desszert': '/images/clock-plate.png',
    'Édes': '/images/clock-plate.png',
    'Snack': '/images/clock-plate.png',
    'Hús': '/icons/peking-duck.png',
    'Főétel': '/icons/peking-duck.png',
    'Vacsora': '/icons/peking-duck.png',
    'Csípős': '/icons/peking-duck.png',
    'Sós': '/icons/peking-duck.png',
    'Reggeli': '/icons/cooking.png',
    'Ebéd': '/icons/cooking.png',
    'Előétel': '/icons/cooking.png',
    'Gyors': '/icons/cooking.png',
    'Időigényes': '/icons/cooking.png'
}

const DEFAULT_RECIPE_IMAGE = '/icons/cooking.png'

const pickCategoryImage = (categories: CategoryLike[]): string => {
    const typed = categories.find(c => c.group_type === 'type' && c.name && CATEGORY_IMAGE_MAP[c.name])
    if (typed?.name) return CATEGORY_IMAGE_MAP[typed.name]!

    const meal = categories.find(c => c.group_type === 'meal' && c.name && CATEGORY_IMAGE_MAP[c.name])
    if (meal?.name) return CATEGORY_IMAGE_MAP[meal.name]!

    for (const c of categories) {
        if (c.name && CATEGORY_IMAGE_MAP[c.name]) return CATEGORY_IMAGE_MAP[c.name]!
    }
    return DEFAULT_RECIPE_IMAGE
}

export const useRecipeImage = () => {
    const getRecipeImage = (recipe: RecipeLike | null | undefined): string => {
        const categories = recipe?.categories ?? []
        if (!categories.length) return DEFAULT_RECIPE_IMAGE
        return pickCategoryImage(categories)
    }

    return { getRecipeImage }
}
