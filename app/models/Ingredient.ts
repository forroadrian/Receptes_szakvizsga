
import type { FreshnessVariants } from "~/interfaces/cardInterfaces/CardGenericInterfaces";
import type Identifiable from "~/interfaces/Identifiable";
import type { IngredientTag, IngredientTagOptions } from "~/interfaces/ModelInterfaces/Tags";

export default class Ingredient implements IngredientTag, Identifiable{
    private _id: number;
    private _tag: FreshnessVariants;
    private _name: string;
    private _quantity: number;
    private _unit: string;
    private _expiry: string;

    constructor(id: number, name: string, quantity: number, unit: string, expiry?: string, tag?: FreshnessVariants) {
        this._id = id
        this._name = name;
        this._quantity = quantity;
        this._unit = unit;
        this._expiry = expiry ?? "2006-01-01"
        this._tag = tag ?? "Friss";
    }



    public get name(): string {
        return this._name;
    }


    public get quantity(): number {
        return this._quantity;
    }


    public get unit(): string {
        return this._unit;
    }

    
    public set name(v : string) {
        this._name = v;
    }

    
    public set quantity(v : number) {
        this._quantity = v;
    }

    
    public set unit(v : string) {
        this._unit = v;
    }
    
    
    public set tag(v : FreshnessVariants) {
        this._tag = v;
    }
    
    public get tag(): FreshnessVariants {
        return this._tag;
    }

    public get id(): number {
        return this._id;
    }
 
    public set id(v : number) {
        this._id = v;
    }

    public get expiry() : string {
        return this._expiry
    }

    
    public set expiry(v : string) {
        this._expiry = v;
    }
    
    
}