export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { recipes, language } = body

    const groqApiKey = process.env.GROQ_API_KEY
    if (!groqApiKey) {
        throw createError({ statusCode: 500, statusMessage: 'GROQ_API_KEY is not configured' })
    }

    const lang = language === 'hu' ? 'Hungarian' : 'English'

    const systemPrompt = `You are a culinary translator. Translate the provided recipe fields into ${lang}.
Translate ONLY: "name", "description", "reason", and each string in "instructions".
Do NOT change: "id" field, ingredient names, units, mealType, tags.
Return valid JSON only in this exact format: { "recipes": [ { "id": "...", "name": "...", "description": "...", "reason": "...", "instructions": ["..."] } ] }`

    const groqResponse = await $fetch<any>('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${groqApiKey}`,
            'Content-Type': 'application/json'
        },
        body: {
            model: 'llama-3.3-70b-versatile',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: JSON.stringify(recipes) }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.1,
            max_tokens: 2048
        }
    })

    const raw = groqResponse.choices?.[0]?.message?.content
    if (!raw) throw createError({ statusCode: 500, statusMessage: 'No response from AI' })

    try {
        const parsed = JSON.parse(raw)
        return Array.isArray(parsed) ? parsed : (parsed.recipes ?? [])
    } catch {
        throw createError({ statusCode: 500, statusMessage: 'Invalid AI response format' })
    }
})
