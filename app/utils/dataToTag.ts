import type Pill from "~/interfaces/Pill"
export type ConversionTable = {name: string, id: string}

export function dataToPillTag(data: any[], conversionTable: ConversionTable): Pill[]  {
    let tags: Pill[] = []
    data.forEach(e => {
        tags.push({name: e[conversionTable.name], identifier: e[conversionTable.id]})
    })
    return tags
}

export const BASIC_CONVERSION: ConversionTable = {name: 'name', id: 'id'}
export const createConversionTable = (name: string, id?: string): ConversionTable => {
    if(!id){
        id = name;
    }
    return {name: name, id: id}
}
