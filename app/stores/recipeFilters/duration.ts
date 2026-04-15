export const durationOptions = [
    { id: 1, label: "15 percen belül", value: "under15" },
    { id: 2, label: "30 percen belül", value: "under30" },
    { id: 3, label: "1 órán belül", value: "under60" },
    { id: 4, label: "1 órán túl", value: "over60" }
];

export const getDurationCategories = () => {
    return durationOptions.map((option) => {
        return {
            id: option.id,
            name: option.label,
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