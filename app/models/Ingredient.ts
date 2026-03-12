import type Identifiable from "~/interfaces/Identifiable";
import type { IngredientTag, IngredientTagOptions } from "~/interfaces/ModelInterfaces/Tags";

export default class Ingredient implements IngredientTag, Identifiable{
    private _id: number;
    private _tag: IngredientTagOptions;
    private _name: string;
    private _amount: number;
    private _unit: string;

    constructor(id: number, name: string, amount: number, unit: string, tag?: IngredientTagOptions) {
        this._id = id
        this._name = name;
        this._amount = amount;
        this._unit = unit;
        this._tag = tag ?? "friss";
    }



    public get name(): string {
        return this._name;
    }


    public get amount(): number {
        return this._amount;
    }


    public get unit(): string {
        return this._unit;
    }

    
    public set name(v : string) {
        this._name = v;
    }

    
    public set amount(v : number) {
        this._amount = v;
    }

    
    public set unit(v : string) {
        this._unit = v;
    }
    
    
    public set tag(v : IngredientTagOptions) {
        this._tag = v;
    }
    
    public get tag() {
        return this._tag;
    }

    public get id(): number {
        return this._id;
    }
 
    public set id(v : number) {
        this._id = v;
    }
}