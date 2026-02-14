export interface SearchOptions {
    visual? : Visual
    data: Data
}

interface Visual {
    placeholder?: string
}

interface Data {
    data: Array<any>
}
