export default class Ingredient {
    private _name: string;
    private _amount: number;
    private _unit: string;

    constructor(name: string, amount: number, unit: string) {
        this._name = name;
        this._amount = amount;
        this._unit = unit;
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
        this.name = v;
    }

    
    public set amount(v : number) {
        this.amount = v;
    }

    
    public set unit(v : string) {
        this.unit = v;
    }
    
    
    


}