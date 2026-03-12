import type UserConstructorOptions from "~/interfaces/ModelInterfaces/UserConstructorOptions";
import type Allergy from "./Allergy";
import type Ingredient from "./Ingredient";
import type Recipe from "./Recipe";
import type Identifiable from "~/interfaces/Identifiable";

export default class User implements Identifiable{
  private _id: number;
  private _username: string;
  private _password_hash: string;
  private _profile_image_url: string;
  private _email: string;
  private _created_at: Date;
  private _dislikes: Ingredient[];
  private _allergies: Allergy[];
  private _ingredients: Ingredient[];
  private _recipes: Recipe[];

  constructor(userData: UserConstructorOptions) {
    this._username = userData.username;
    this._password_hash = userData.password_hash;
    this._profile_image_url = userData.profile_image_url;
    this._email = userData.email;
    this._created_at = userData.created_at;
    this._id = userData.id ?? -1;
    this._dislikes = userData.dislikes;
    this._allergies = userData.allergies;
    this._ingredients = userData.ingredients;
    this._recipes = userData.recipes;
  }

  public set id(v: number) {
    this._id = v;
  }

  public set username(v: string) {
    this._username = v;
  }

  public set password_hash(v: string) {
    this._password_hash = v;
  }

  public set profile_image_url(v: string) {
    this._profile_image_url = v;
  }

  public set email(v: string) {
    this._email = v;
  }

  public set created_at(v: Date) {
    this._created_at = v;
  }

  public get id(): number {
    return this._id;
  }

  public get username(): string {
    return this._username;
  }

  public get password_hash(): string {
    return this._password_hash;
  }

  public get profile_image_url(): string {
    return this._profile_image_url;
  }

  public get email(): string {
    return this._email;
  }

  public get created_at(): Date {
    return this._created_at;
  }

  public set dislikes(v: Ingredient[]) {
    this._dislikes = v;
  }

  public get dislikes(): Ingredient[] {
    return this._dislikes;
  }

  public set allergies(v: Allergy[]) {
    this._allergies = v;
  }

  public get allergies(): Allergy[] {
    return this._allergies;
  }

  public set ingredients(v: Ingredient[]) {
    this._ingredients = v;
  }

  public get ingredients(): Ingredient[] {
    return this._ingredients;
  }

  public set recipes(v: Recipe[]) {
    this._recipes = v;
  }

  public get recipes(): Recipe[] {
    return this._recipes;
  }

  public addRecipe(recipe: Recipe) {
    this._recipes.push(recipe);
  }

  public addAllergy(allergy: Allergy) {
    this._allergies.push(allergy);
  }

  public addIngredient(ingredient: Ingredient) {
    this._ingredients.push(ingredient);
  }

  public addDislike(dislike: Ingredient) {
    this._dislikes.push(dislike);
  }

  public getDislike(id: number): Ingredient | undefined {
    return this._dislikes.find((d) => d.id === id);
  }

  public deleteDislike(id: number): void {
    this._dislikes = this._dislikes.filter((d) => d.id !== id);
  }

  public replaceDislike(id: number, newDislike: Ingredient): void {
    const index = this._dislikes.findIndex((d) => d.id === id);
    if (index !== -1) {
      this._dislikes[index] = newDislike;
    }
  }

  public getAllergy(id: number): Allergy | undefined {
    return this._allergies.find((a) => a.id === id);
  }

  public deleteAllergy(id: number): void {
    this._allergies = this._allergies.filter((a) => a.id !== id);
  }

  public replaceAllergy(id: number, newAllergy: Allergy): void {
    const index = this._allergies.findIndex((a) => a.id === id);
    if (index !== -1) {
      this._allergies[index] = newAllergy;
    }
  }

  public getIngredient(id: number): Ingredient | undefined {
    return this._ingredients.find((i) => i.id === id);
  }

  public deleteIngredient(id: number): void {
    this._ingredients = this._ingredients.filter((i) => i.id !== id);
  }

  public replaceIngredient(id: number, newIngredient: Ingredient): void {
    const index = this._ingredients.findIndex((i) => i.id === id);
    if (index !== -1) {
      this._ingredients[index] = newIngredient;
    }
  }

  public getRecipe(id: number): Recipe | undefined {
    return this._recipes.find((r) => r.id === id);
  }

  public deleteRecipe(id: number): void {
    this._recipes = this._recipes.filter((r) => r.id !== id);
  }

  public replaceRecipe(id: number, newRecipe: Recipe): void {
    const index = this._recipes.findIndex((r) => r.id === id);
    if (index !== -1) {
      this._recipes[index] = newRecipe;
    }
  }
}
