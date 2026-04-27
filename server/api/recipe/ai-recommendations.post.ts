export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const {
        language,
        pantry,
        filters,
        availableMealTypes,
        availableTags,
        availableIngredients
    } = body

    const groqApiKey = process.env.GROQ_API_KEY
    if (!groqApiKey) {
        throw createError({ statusCode: 500, statusMessage: 'GROQ_API_KEY is not configured' })
    }

    const lang = language === 'hu' ? 'Hungarian' : 'English'

    // Randomly pick 5 distinct cuisine regions each request to force variety
    const allCuisines = [
        'Hungarian (e.g. töltött káposzta, halászlé, rakott krumpli, lángos, lecsó, pörkölt)',
        'Italian (e.g. risotto, osso buco, saltimbocca, ribollita, caponata, arancini)',
        'Japanese (e.g. tonkatsu, okonomiyaki, gyoza, yakitori, miso ramen)',
        'Thai (e.g. green curry, massaman curry, pad see ew, som tum)',
        'Indian (e.g. biryani, palak paneer, chana masala, dal makhani, samosa)',
        'French (e.g. coq au vin, ratatouille, cassoulet, quiche lorraine, soupe à l\'oignon)',
        'Mexican (e.g. enchiladas, pozole, mole, chiles rellenos, tamales)',
        'Spanish (e.g. paella valenciana, gazpacho, patatas bravas, croquetas, tortilla española)',
        'Greek (e.g. moussaka, spanakopita, kleftiko, gemista, souvlaki)',
        'Middle Eastern (e.g. shakshuka, kofta, mansaf, musakhan, falafel)',
        'Vietnamese (e.g. pho, bun bo hue, bánh mì filling, bun cha)',
        'Korean (e.g. bibimbap, japchae, sundubu jjigae, galbi, doenjang jjigae)',
        'American (e.g. jambalaya, gumbo, clam chowder, pulled pork, mac and cheese)',
        'Eastern European (e.g. pierogi, borscht, sarmale, bigós, žemiaková polievka)',
        'Moroccan (e.g. tagine, harira, bastilla, couscous tfaya)',
        'Chinese (e.g. mapo tofu, kung pao chicken, hong shao rou, dan dan noodles)',
    ]
    const shuffled = allCuisines.sort(() => Math.random() - 0.5)
    const selectedCuisines = shuffled.slice(0, 5)

    const constraints: string[] = []
    if (filters?.mealType) constraints.push(`- Meal type MUST be: ${filters.mealType}`)
    if (filters?.tags?.length) constraints.push(`- Each recipe MUST match these tags: ${filters.tags.join(', ')}`)
    if (filters?.maxDuration) constraints.push(`- Preparation time MUST be at most ${filters.maxDuration} minutes`)
    if (filters?.minDuration) constraints.push(`- Preparation time MUST be more than ${filters.minDuration} minutes`)
    if (filters?.avoidAllergens?.length) constraints.push(`- MUST NOT contain these allergens: ${filters.avoidAllergens.join(', ')}`)
    if (filters?.avoidIngredients?.length) constraints.push(`- MUST NOT contain these ingredients: ${filters.avoidIngredients.join(', ')}`)
    if (filters?.search) constraints.push(`- Recipes should match the keyword: "${filters.search}"`)

    const pantryText = pantry?.length
        ? pantry.map((i: any) => `${i.name} (${i.quantity} ${i.unit})`).join(', ')
        : (language === 'hu' ? 'üres' : 'empty')

    const systemPrompt = `You are a culinary assistant. Recommend 5 well-known, established recipes from Hungarian and international cuisine — recipes that are widely recognized and can be found in cookbooks or popular cooking websites. Only suggest dishes that genuinely exist and are commonly made; do NOT invent or combine fictional recipes.

Always respond in ${lang} with valid JSON only — no markdown, no extra text.

Response format (always a JSON object with a "recommendations" array of exactly 5 items):
{
  "recommendations": [
    {
      "name": "Recipe name in ${lang}",
      "description": "2-3 sentence description in ${lang}",
      "reason": "1 short sentence in ${lang} explaining why this fits the user",
      "prepTime": 30,
      "servings": 4,
      "mealType": "exact name from available meal types",
      "tags": ["exact name from available tags"],
      "ingredients": [
        { "name": "exact name from ingredients catalog", "quantity": 200, "unit": "g" }
      ],
      "instructions": ["Step 1...", "Step 2..."]
    }
  ]
}

Rules:
- Generate exactly 5 DIFFERENT recipes — each must be a genuinely existing, well-known dish with a real name that can be found in cookbooks or on popular cooking websites
- Each recipe MUST come from a DIFFERENT cuisine from this session's rotation: ${selectedCuisines.join(' | ')}
- NEVER suggest these overused defaults: Carbonara, Csirke paprikás, Gulyás, Bolognese, Margherita pizza, Chicken tikka masala, Pad Thai — unless explicitly required by filters
- If you are not certain a recipe genuinely exists and is commonly made, do not include it
- prepTime is in minutes (integer), servings is integer
- mealType MUST be one of the available meal types (use the EXACT spelling)
- Each tag MUST be from the available tags list (use the EXACT spelling)
- Each ingredient name MUST be from the available ingredients catalog (use the EXACT spelling)
- Skip recipes that need ingredients NOT in the catalog
- Provide 4-8 ingredients and 4-7 instruction steps per recipe
- The "reason" field MUST be unique for every recipe — never use the same sentence structure twice
- Each reason must highlight something genuinely specific to THAT dish: its cultural origin, a distinctive flavour, a key technique, a seasonal angle, a texture contrast, why it suits the pantry, a health benefit, a comfort or occasion angle — pick a DIFFERENT angle for each recipe
- Keep it to 1 punchy sentence, no filler words
- Do NOT use phrases like "gyorsan elkészíthető", "klasszikus fogás", "könnyen elkészíthetünk", "üresjáratban" — these are banned
- Good reason examples: "A hosszú párolás alatt a hús magába szívja a fűszerek aromáját — igazi mélységes ízvilág.", "A citrom és fokhagyma kombinációja frissességet ad ennek a mediterrán klasszikusnak.", "Vietnámi street food kedvenc: a rizstészta és friss fűszernövények könnyűvé teszik a tálat.", "A karamellizált hagyma édes mélységet ad a húslevesnek — tökéletes hideg estékre."

ACTIVE FILTERS / CONSTRAINTS:
${constraints.length ? constraints.join('\n') : '- none (free choice)'}

User's pantry (prefer these where possible): ${pantryText}

Available meal types (use EXACT names): ${availableMealTypes.join(', ')}
Available tags (use EXACT names): ${availableTags.join(', ')}
Available ingredients catalog (use EXACT names only): ${availableIngredients.join(', ')}`

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
                {
                    role: 'user',
                    content: language === 'hu'
                        ? `Adj 5 receptötletet a megadott szűrők alapján! Seed: ${Math.random().toString(36).slice(2, 8)}`
                        : `Give me 5 recipe ideas matching the constraints! Seed: ${Math.random().toString(36).slice(2, 8)}`
                }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.65,
            max_tokens: 4096
        }
    })

    const raw = groqResponse.choices?.[0]?.message?.content
    if (!raw) throw createError({ statusCode: 500, statusMessage: 'No response from AI' })

    try {
        const parsed = JSON.parse(raw)
        const recommendations = Array.isArray(parsed)
            ? parsed
            : (parsed.recommendations ?? parsed.recipes ?? [])

        return recommendations.map((r: any, idx: number) => ({
            id: `ai-${idx}`,
            name: String(r.name ?? ''),
            description: String(r.description ?? ''),
            reason: String(r.reason ?? ''),
            prepTime: Number(r.prepTime ?? 30),
            servings: Number(r.servings ?? 4),
            mealType: String(r.mealType ?? ''),
            tags: Array.isArray(r.tags) ? r.tags.map(String) : [],
            ingredients: Array.isArray(r.ingredients)
                ? r.ingredients.map((ing: any) => ({
                    name: String(ing.name ?? ''),
                    quantity: Number(ing.quantity ?? 0),
                    unit: String(ing.unit ?? '')
                }))
                : [],
            instructions: Array.isArray(r.instructions) ? r.instructions.map(String) : []
        })).filter((r: any) => r.name.length > 0)
    } catch {
        throw createError({ statusCode: 500, statusMessage: 'Invalid AI response format' })
    }
})
