type TagVariant = 'active'|'outline'|'greyed'|'custom'|'warning'
export type FreshnessVariants = "fresh" | "soon" | "expired"

export interface CardTagItem {
    label: string,
    variant?: TagVariant 
}

export interface CardBaseProps {
    orientation?: "horizontal" | "vertical",
    variant?: "outline" | "subtle",
    showDivider?: boolean,
    mediaPosition?: "top" | "topLeft",
    tagPosition?: "above" | "below",
    mediaClass?: string,
    bodyClass?: string,
    contentClass?: string,
    mediaTopClass?: string,
    mediaLeftClass?: string,
    headerClass?: string,
    metadataClass?: string,
    tagsClass?:string,
    dividerClass?:string,
    footerClass?:string
}
