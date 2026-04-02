import type Identifiable from "~/interfaces/Identifiable";
import type RecipeConstuctorOptions from "~/interfaces/ModelInterfaces/RecipeConstructorOptions";

export default class Recipe implements Identifiable {
    private _id: number;
    private _author_id: string | null;
    private _name: string;
    private _description: string;
    private _saves: number;
    private _likes: number;
    private _time: number;
    private _servings: number;
    private _created_at: Date;
    private _last_edit: Date;
    private _is_ai_generated: boolean;
    private _active: boolean;
    private _deleted_at?: Date;

    constructor(options: RecipeConstuctorOptions){
        this._id = options.id ?? -1
        this._author_id = options.author_id;
        this._name = options.name
        this._description = options.description
        this._saves = options.saves ?? 0
        this._likes = options.likes ?? 0
        this._time = options.time
        this._servings = options.servings
        this._created_at = options.created_at
        this._last_edit = options.last_edit
        this._is_ai_generated = options.is_ai_generated
        this._active = options.active ?? true
        this._deleted_at = options.deleted_at
    }

    public set id(v : number) {
        this._id = v;
    }

    
    public get id() : number {
        return this._id;
    }

    public set author_id(v: string | null) {
        this._author_id = v;
    }

    public get author_id(): string | null {
        return this._author_id;
    }

    public set name(v : string) {
        this._name = v;
    }

    
    public get name() : string {
        return this._name;
    }

    public set description(v : string) {
        this._description = v;
    }

    
    public get description() : string {
        return this._description;
    }

    public set saves(v : number) {
        this._saves = v;
    }

    
    public get saves() : number {
        return this._saves;
    }

    public set time(v : number) {
        this._time = v;
    }

    
    public get time() : number {
        return this._time;
    }

    public set likes(v : number) {
        this._likes = v;
    }

    
    public get likes() : number {
        return this._likes;
    }

    public set servings(v : number) {
        this._servings = v;
    }

    
    public get servings() : number {
        return this._servings;
    }

    public set created_at(v : Date) {
        this._created_at = v;
    }

    
    public get created_at() : Date {
        return this._created_at;
    }

    public set last_edit(v : Date) {
        this._last_edit = v;
    }

    
    public get last_edit() : Date {
        return this._last_edit;
    }

    public set is_ai_generated(v : boolean) {
        this._is_ai_generated = v;
    }

    
    public get is_ai_generated() : boolean {
        return this._is_ai_generated;
    }

    public set active(v : boolean) {
        this._active = v;
    }

    
    public get active() : boolean {
        return this._active;
    }

    public set deleted_at(v : Date) {
        this._deleted_at = v;
    }

    
    public get deleted_at() : Date | null {
        return this._deleted_at ?? null;
    }
    
    
}