export const useIngredientFormatter = () => {
    const { $i18n } = useNuxtApp()

    const formatIngredient = (id: string | number | null | undefined): string => {
        if (id === null || id === undefined || id === '') return ''
        const key = `ingredient.${id}`
        return $i18n.te(key) ? $i18n.t(key) : String(id)
    }

    return { formatIngredient }
}
