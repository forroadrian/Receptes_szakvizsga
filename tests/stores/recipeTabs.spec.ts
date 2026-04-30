import { describe, it, expect } from 'vitest'
import { getTabRecipes } from '~/stores/recipeFilters/recipeTabs'

const USER_ID = 'user-abc'

const publicRecipe  = { id: 1, name: 'Gulyásleves',  author_id: null,     public: true  }
const ownRecipe     = { id: 2, name: 'Sajt szendvics', author_id: USER_ID, public: false }
const otherRecipe   = { id: 3, name: 'Rántott hús',   author_id: 'other',  public: true  }

const allRecipes = [publicRecipe, ownRecipe, otherRecipe]

describe('getTabRecipes', () => {
    it('"own" tab returns only the recipes created by the logged-in user', () => {
        const result = getTabRecipes(allRecipes, 'own', USER_ID)
        expect(result).toHaveLength(1)
        expect(result[0].id).toBe(2)
    })

    it('"ai" tab always returns an empty array (AI recipes live in the store, not here)', () => {
        const result = getTabRecipes(allRecipes, 'ai', USER_ID)
        expect(result).toHaveLength(0)
    })
})
