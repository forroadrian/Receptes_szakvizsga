export const useUnitFormatter = () => {
    const { $i18n } = useNuxtApp()

    const formatUnit = (unit: string | null | undefined): string => {
        if (!unit) return ''
        const key = `units.${unit}`
        return $i18n.te(key) ? $i18n.t(key) : unit
    }

    return { formatUnit }
}
