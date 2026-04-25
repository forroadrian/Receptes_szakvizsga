export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { message, language, pantry, availableCategories, availableIngredients, history } = body

    const groqApiKey = process.env.GROQ_API_KEY
    if (!groqApiKey) {
        throw createError({ statusCode: 500, statusMessage: 'GROQ_API_KEY is not configured' })
    }

    const mealTypeNames = availableCategories
        .filter((c: any) => c.group_type === 'meal')
        .map((c: any) => c.name)
        .join(', ')

    const tagNames = availableCategories
        .filter((c: any) => c.group_type === 'type')
        .map((c: any) => c.name)
        .join(', ')

    const catalogNames = availableIngredients
        .map((i: any) => i.name)
        .join(', ')

    const pantryText = pantry.length > 0
        ? pantry.map((i: any) => `${i.name} (${i.quantity} ${i.unit})`).join(', ')
        : language === 'hu'
            ? 'Üres – a felhasználónak nincs hozzáadva hozzávaló a kamrájához.'
            : 'Empty – the user has no ingredients in their pantry.'

    const lang = language === 'hu' ? 'Hungarian' : 'English'

    const systemPrompt = `You are a friendly cooking assistant built into a recipe management web application called "MenuPlanr". The app lets logged-in users:
- Browse, search, save, and like recipes
- Create and edit custom recipes (4-step form: basic info → meal type & tags → ingredients → instructions)
- Plan weekly menus
- Manage their ingredient pantry (what they have at home)
- Filter recipes by category, duration, allergens, and disliked ingredients
- Set food allergies and disliked ingredients in their profile — these are then used to automatically filter out unsuitable recipes when browsing

Always respond in ${lang}. Be helpful, concise, and friendly.

You MUST always return a valid JSON object — no markdown, no extra text — in exactly this format:

When answering a general question:
{ "type": "text", "message": "Your answer here" }

When suggesting a single recipe:
{
  "type": "recipe",
  "message": "A short friendly intro before showing the recipe",
  "recipe": {
    "name": "Recipe name",
    "description": "2-3 sentence description",
    "prepTime": 30,
    "servings": 4,
    "mealType": "exact name from available meal types list",
    "tags": ["exact name from available tags list"],
    "ingredients": [
      { "name": "exact name from ingredients catalog", "quantity": 200, "unit": "g" }
    ],
    "instructions": ["Step 1...", "Step 2..."]
  }
}

SPECIAL RULE — Quick meal ideas:
When the user asks for quick/easy meal ideas (or a list of suggestions), respond with type "text" and list exactly 10 recipe ideas, numbered 1–10, each on a new line with a very short description. Do NOT return a full recipe yet.
When the user then selects one (by number or name), respond with type "recipe" for that specific dish.
If the user says none of the suggestions are good (e.g. "none of these", "something else", "más legyen"), provide a new list of 10 different ideas again as type "text".

Use "recipe" type when the user asks for a specific recipe, asks what to cook, or selects from a suggestion list.
Use "text" type for general questions, app info, and suggestion lists.
If the pantry is empty and the user asks what to cook from what's at home, tell them to add ingredients to their pantry first.

Available meal types (use exact names): ${mealTypeNames}
Available tags (use exact names): ${tagNames}
User's pantry: ${pantryText}
Available ingredients catalog (only use names from this list): ${catalogNames}`

    const chatHistory = (history ?? []).map((h: any) => ({
        role: h.role as 'user' | 'assistant',
        content: h.content
    }))

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
                ...chatHistory,
                { role: 'user', content: message }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7,
            max_tokens: 2048
        }
    })

    const raw = groqResponse.choices?.[0]?.message?.content
    if (!raw) throw createError({ statusCode: 500, statusMessage: 'No response from AI' })

    try {
        return JSON.parse(raw)
    } catch {
        throw createError({ statusCode: 500, statusMessage: 'Invalid AI response format' })
    }
})