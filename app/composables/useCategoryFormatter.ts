export const useCategoryFormatter = () => {
    const { $i18n } = useNuxtApp()

    const formatCategory = (id: string | number | null | undefined): string => {
        if (id === null || id === undefined || id === '') return ''
        const key = `categories.${id}`
        return $i18n.te(key) ? $i18n.t(key) : String(id)
    }

    return { formatCategory }
}
