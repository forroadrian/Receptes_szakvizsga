import Ingredient from "~/models/Ingredient";

export default interface RecipeConstuctorOptions {
    id?: number;
    author_id: string | null;
    name: string;
    description: string;
    saves?: number;
    likes?: number;
    time: number;
    servings: number;
    created_at: Date;
    last_edit: Date;
    is_ai_generated: boolean;
    active?: boolean;
    deleted_at?: Date;
    steps?: string[];
    ingredients?: Ingredient[];
}