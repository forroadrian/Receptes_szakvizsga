import type SearchParams from "~/interfaces/SearchParams";

export const useSearch = <T extends object>(params: Ref<SearchParams<T>>) => {
    return computed(() => {
        const { haystack, searchFor, query, showAllByDefault, filter } = params.value;
        const queryEmpty = query === undefined || query.length === 0;
        if (showAllByDefault && queryEmpty) return haystack;

        return haystack.filter((element) => {
            return searchFor.some((key) => {
                const value = getValue(element, key as string);
                if (filter) return filter(value);
                if (typeof value !== "string") return false;
                const lower = value.toLowerCase();
                if (typeof query === "string") {
                    return lower.includes(query.toLowerCase());
                }
                if (Array.isArray(query)) {
                    return query.some((s) => typeof s === "string" && lower.includes(s.toLowerCase()));
                }
                return false;
            });
        });
    });
};
