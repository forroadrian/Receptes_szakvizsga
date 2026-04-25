export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { language, pantry, recipes, userAllergyNames, dislikedIngredientNames } = body

    const groqApiKey = process.env.GROQ_API_KEY
    if (!groqApiKey) {
        throw createError({ statusCode: 500, statusMessage: 'GROQ_API_KEY is not configured' })
    }

    const lang = language === 'hu' ? 'Hungarian' : 'English'

    const pantryText = pantry.length > 0
        ? pantry.map((i: any) => `${i.name} (${i.quantity} ${i.unit})`).join(', ')
        : (language === 'hu' ? 'Üres kamra' : 'Empty pantry')

    const recipeList = recipes.map((r: any) =>
        `ID:${r.id} | ${r.name} | Ingredients: ${r.ingredientNames.join(', ')} | Categories: ${r.categoryNames.join(', ')}`
    ).join('\n')

    const systemPrompt = `You are a recipe recommendation engine. Pick the best matching recipes from the provided list based on the user's pantry and preferences.

Always respond in ${lang} with valid JSON only — no markdown, no extra text.

Response format (always a JSON object, never an array):
{ "recommendations": [ { "recipeId": 123, "reason": "Short 1-sentence reason" }, ... ] }

Rules:
- Pick exactly 5 recipes (or fewer only if the list has fewer than 5 items)
- Strongly prefer recipes where the user already has most or all ingredients in their pantry
- Avoid recipes that contain the user's allergens or disliked ingredients when possible
- Each reason must be 1 short friendly sentence in ${lang} explaining why this recipe was picked
- Only use recipe IDs from the provided list

User's pantry: ${pantryText}
User's allergens: ${userAllergyNames.length ? userAllergyNames.join(', ') : 'none'}
User's disliked ingredients: ${dislikedIngredientNames.length ? dislikedIngredientNames.join(', ') : 'none'}

Available recipes:
${recipeList}`

    const groqResponse = await $fetch<any>('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${groqApiKey}`,
            'Content-Type': 'application/json'
        },
        body: {
            model: 'llama-3.1-8b-instant',
            messages: [
                { role: 'system', content: systemPrompt },
                {
                    role: 'user',
                    content: language === 'hu'
                        ? 'Kérlek ajánlj recepteket a kamrám alapján!'
                        : 'Please recommend recipes based on my pantry!'
                }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.5,
            max_tokens: 512
        }
    })

    const raw = groqResponse.choices?.[0]?.message?.content
    if (!raw) throw createError({ statusCode: 500, statusMessage: 'No response from AI' })

    try {
        const parsed = JSON.parse(raw)
        const recommendations = Array.isArray(parsed)
            ? parsed
            : (parsed.recommendations ?? parsed.recipes ?? [])
        return recommendations
    } catch {
        throw createError({ statusCode: 500, statusMessage: 'Invalid AI response format' })
    }
})
