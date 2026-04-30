export const ALLOWED_NAV_PATHS = new Set([
    '/',
    '/recipes',
    '/ingredients',
    '/menu',
    '/profile',
    '/profile/username',
    '/profile/password',
    '/profile/email',
    '/profile/allergen',
    '/profile/dislikedIngredient',
    '/login',
    '/register',
])

export function sanitizeMessage(raw: string): string {
    const normalized = raw.replace(/\\"/g, '"')
    const escaped = normalized
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
    const q = `(?:&quot;|')`
    return escaped.replace(
        new RegExp(`&lt;a class=${q}nav${q} href=${q}([^&'"]+)${q}&gt;([\\s\\S]*?)&lt;/a&gt;`, 'g'),
        (_, href, label) =>
            ALLOWED_NAV_PATHS.has(href)
                ? `<a class="chat-nav" data-nav-href="${href}">${label}</a>`
                : label,
    )
}
