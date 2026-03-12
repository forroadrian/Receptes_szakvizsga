import type Allergy from "~/models/Allergy";
import type Ingredient from "~/models/Ingredient";
import type Recipe from "~/models/Recipe";

export default interface UserConstructorOptions {
    id?: number,
    username: string,
    password_hash: string,
    profile_image_url: string,
    email: string,
    created_at: Date,
    dislikes: Ingredient[],
    allergies: Allergy[],
    ingredients: Ingredient[],
    recipes: Recipe[]
}