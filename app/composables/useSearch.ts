import type SearchParams from "~/interfaces/SearchParams";

export const useSearch = <T extends object>(params: Ref<SearchParams<T>>) => {
    return computed(() => {
        if (params.value.showAllByDefault && (params.value.query?.length == 0 || params.value.query == undefined)) return params.value.haystack;
        return params.value.haystack.filter((element) => {
            return params.value.searchFor.some((key) => {
                const value = getValue(element, key as string);

                if (params.value.filter) return params.value.filter(value);
                if (params.value.query) {
                    if (typeof value !== "string") return false;
                    return value.toLowerCase().includes(params.value.query.toLowerCase());
                }
                return false;
            });
        });
    });
};