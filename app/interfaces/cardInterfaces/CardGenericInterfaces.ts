type TagVariant = 'active'|'outline'|'greyed'

export interface CardTagItem {
    label: string,
    variant?: TagVariant 
}

export interface CardBaseProps {
    orientation?: "horizontal" | "vertical",
    variant?: "outline" | "subtle",
    showDivider?: boolean,
    mediaPosition?: "top" | "topLeft",
    tagPosition?: "above" | "below"
}