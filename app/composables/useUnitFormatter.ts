export const useUnitFormatter = () => {
    const { t, te } = useI18n()

    const formatUnit = (unit: string | null | undefined): string => {
        if (!unit) return ''
        const key = `units.${unit}`
        return te(key) ? t(key) : unit
    }

    return { formatUnit }
}
