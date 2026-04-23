export const durationOptions = [
    { id: 1, value: "under15" },
    { id: 2, value: "under30" },
    { id: 3, value: "under60" },
    { id: 4, value: "over60" }
];

export const getDurationCategories = () => {
    const {t} = useI18n()
    return durationOptions.map((option) => {
        return {
            id: option.id,
            name: t('duration.' + option.id),
            group_type: ""
        };
    });
};

export const getActiveDuration = (selectedDurationId: number | null) => {
    if (selectedDurationId === null) {
        return null;
    }

    for (const option of durationOptions) {
        if (option.id === selectedDurationId) {
            return option.value;
        }
    }

    return null;
};