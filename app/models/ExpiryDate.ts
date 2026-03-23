import type { FreshnessVariants } from "~/interfaces/cardInterfaces/CardGenericInterfaces"

export default class ExpiryDate {
    private _date : Date

    constructor(date: Date) {
        this._date = date
    }

    public toStamp() {
        this.value.toISOString()
    }

    public toShort(){
        const padMonth = this.value.getMonth().toString().padStart(2,"0")
        const padDay = this.value.getDay().toString().padStart(2,"0")
        return this._date.getFullYear() + "-" + padMonth + "-" + padDay
    }

    public checkExpiry(): FreshnessVariants{
        const saved = this._date.valueOf()
        const today = Date.now()
        const day = 60 * 60 * 24
        console.log(saved);
        console.log(today);
        console.log(day);
        
        
        
        return saved <=today 
            ? "Lejárt" : saved <= today - day
            ? "Hamarosan Lejár" : "Friss"
    }

    get value() {
        return this._date
    }

}