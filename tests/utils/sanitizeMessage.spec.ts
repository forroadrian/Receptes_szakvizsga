import { describe, it, expect } from 'vitest'
import { sanitizeMessage } from '~/utils/sanitizeMessage'

describe('sanitizeMessage', () => {
    describe('XSS protection', () => {
        it('escapes raw HTML tags so they cannot execute as markup', () => {
            const result = sanitizeMessage('<script>alert("xss")</script>')
            expect(result).not.toContain('<script>')
            expect(result).toContain('&lt;script&gt;')
        })
    })

    describe('nav link allowlist', () => {
        it('converts an allowed <a class="nav"> link into a safe chat-nav anchor', () => {
            const input = '<a class="nav" href="/recipes">Receptek</a>'
            const result = sanitizeMessage(input)
            expect(result).toBe('<a class="chat-nav" data-nav-href="/recipes">Receptek</a>')
        })

        it('strips an invented href and keeps only the label text', () => {
            const input = '<a class="nav" href="/admin/secret">Admin</a>'
            const result = sanitizeMessage(input)
            expect(result).toBe('Admin')
            expect(result).not.toContain('<a')
        })

        it('handles double-escaped quotes that some AI models produce', () => {
            const input = '<a class=\\"nav\\" href=\\"/menu\\">Menütervező</a>'
            const result = sanitizeMessage(input)
            expect(result).toBe('<a class="chat-nav" data-nav-href="/menu">Menütervező</a>')
        })
    })
})
