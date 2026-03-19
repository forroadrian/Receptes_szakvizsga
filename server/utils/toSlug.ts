export default function toSlug(base: string): string {
    return base.toLowerCase().replace(/\s+/g, "-");
}