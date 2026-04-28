export const useCategoryFormatter = () => {
    const { t, te } = useI18n()

    const formatCategory = (id: string | number | null | undefined): string => {
        if (id === null || id === undefined || id === '') return ''
        const key = `categories.${id}`
        return te(key) ? t(key) : String(id)
    }

    return { formatCategory }
}
