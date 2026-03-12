import type Identifiable from "~/interfaces/Identifiable";

export default class Allergy implements Identifiable {
    private _id: number;
    private _name: string;

    constructor(name: string, id?:number){
        this._id = id ?? -1
        this._name = name
    }

    
    public set id(v : number) {
        this._id = v;
    }

    public get id(): number {
        return this._id
    }

    public set name(v : string) {
        this._name = v;
    }

    public get name(): string {
        return this._name
    }
    
}