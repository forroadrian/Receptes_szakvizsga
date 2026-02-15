import type Ingredient from "~/models/Ingredient";

export interface SearchOptions {
    placeholder? :string,
    haystack: possibleHaystack
}

export type possibleHaystack = Array<Ingredient> 