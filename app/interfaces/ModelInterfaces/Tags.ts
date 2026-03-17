import type { FreshnessVariants } from "../cardInterfaces/CardGenericInterfaces";

export default interface BaseTag {
    tag: string;
} 

export type IngredientTagOptions =  "friss" | "hamarosan lejar" | "lejart"

export interface IngredientTag extends BaseTag {
    tag: FreshnessVariants;
}