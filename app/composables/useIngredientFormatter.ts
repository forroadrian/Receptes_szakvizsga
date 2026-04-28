export const useIngredientFormatter = () => {
    const { t, te } = useI18n()

    const formatIngredient = (id: string | number | null | undefined): string => {
        if (id === null || id === undefined || id === '') return ''
        const key = `ingredient.${id}`
        return te(key) ? t(key) : String(id)
    }

    return { formatIngredient }
}
