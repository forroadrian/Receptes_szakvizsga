import type { FreshnessVariants } from "~/interfaces/cardInterfaces/CardGenericInterfaces"

export default class ExpiryDate {
    private _date : Date;

    constructor(date: Date) {
        this._date = date;
    }

    public toStamp() {
        return this.value.toISOString();
    }

    public toShort(){
        const readableMonth = (this.value.getMonth() + 1);
        const padMonth = readableMonth.toString().padStart(2,"0");
        const padDay = this.value.getDate().toString().padStart(2,"0");

        return this._date.getFullYear() + "-" + padMonth + "-" + padDay;
    }

    public checkExpiry(): FreshnessVariants{
        const saved = this._date.valueOf();
        const today = Date.now();
        const threeDays = 3 * 24 * 60 * 60 * 1000;

        return saved <= today
            ? "Lejárt" : saved <= today + threeDays
            ? "Hamarosan" : "Friss";
    }

    get value() {
        return this._date;
    }

}