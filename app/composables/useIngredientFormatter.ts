type IngredientLike = { id: string | number; name?: string | null }

export const useIngredientFormatter = () => {
    const { $i18n } = useNuxtApp()

    const formatIngredient = (
        idOrItem: string | number | IngredientLike | null | undefined,
        fallbackName?: string | null
    ): string => {
        if (idOrItem === null || idOrItem === undefined || idOrItem === '') return ''

        let id: string | number
        let name: string | null | undefined = fallbackName

        if (typeof idOrItem === 'object') {
            id = idOrItem.id
            name = idOrItem.name ?? fallbackName
        } else {
            id = idOrItem
        }

        const key = `ingredient.${id}`
        if ($i18n.te(key)) return $i18n.t(key)
        return name || String(id)
    }

    return { formatIngredient }
}
