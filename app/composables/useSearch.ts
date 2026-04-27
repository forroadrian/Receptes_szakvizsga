import type SearchParams from "~/interfaces/SearchParams";

const funcMap: {
    [index: string]: (base: string, search: string) => boolean
} = {
    tag: (base: string, search: string) => base.toLowerCase().includes(search.toLowerCase()),
    default: (base: string, search: string) => base.toLowerCase() === search.toLowerCase()
}

export const useSearch = <T extends object>(params: Ref<SearchParams<T>>) => {
    return computed(() => {
        if (params.value.showAllByDefault && (params.value.query?.length == 0 || params.value.query == undefined)) return params.value.haystack;
        return params.value.haystack.filter((element) => {
            return params.value.searchFor.some((key) => {
                const value = getValue(element, key as string);
                if (params.value.filter) return params.value.filter(value);
                const func = funcMap[value] ?? funcMap["default"]
                if(typeof(params.value.query) === "string"){
                    return value.toLowerCase().includes(params.value.query.toLowerCase());
                }
                else if(typeof(params.value.query) === "object") {
                    return (params.value.query as string[]).some((s) => {
                        if(typeof(s) !== "string") return false;
                        return value.toLowerCase().includes(s.toLowerCase());
                    });
                }
                return false;
            });
        });
    });
};