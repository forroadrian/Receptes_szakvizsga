export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      allergy: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
        Relationships: []
      }
      category: {
        Row: {
          group_type: Database["public"]["Enums"]["group_types"] | null
          id: number
          name: string | null
        }
        Insert: {
          group_type?: Database["public"]["Enums"]["group_types"] | null
          id?: number
          name?: string | null
        }
        Update: {
          group_type?: Database["public"]["Enums"]["group_types"] | null
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      ingredient: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: number
          is_active: boolean
          last_used_at: string
          name: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: number
          is_active?: boolean
          last_used_at?: string
          name: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: number
          is_active?: boolean
          last_used_at?: string
          name?: string
        }
        Relationships: []
      }
      ingredient_allergy: {
        Row: {
          allergy_id: number
          ingredient_id: number
        }
        Insert: {
          allergy_id: number
          ingredient_id: number
        }
        Update: {
          allergy_id?: number
          ingredient_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "ingredient_allergy_allergy_fk"
            columns: ["allergy_id"]
            isOneToOne: false
            referencedRelation: "allergy"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ingredient_allergy_ingredient_fk"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredient"
            referencedColumns: ["id"]
          },
        ]
      }
      ingredient_category: {
        Row: {
          category_id: number
          ingredient_id: number
        }
        Insert: {
          category_id: number
          ingredient_id: number
        }
        Update: {
          category_id?: number
          ingredient_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "ingredient_category_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ingredient_category_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredient"
            referencedColumns: ["id"]
          },
        ]
      }
      menu: {
        Row: {
          active: boolean
          deleted_at: string | null
          id: number
          name: string | null
          planned_date: string | null
          user_id: string
        }
        Insert: {
          active?: boolean
          deleted_at?: string | null
          id?: number
          name?: string | null
          planned_date?: string | null
          user_id: string
        }
        Update: {
          active?: boolean
          deleted_at?: string | null
          id?: number
          name?: string | null
          planned_date?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_user_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_recipe: {
        Row: {
          menu_id: number
          recipe_id: number
        }
        Insert: {
          menu_id: number
          recipe_id: number
        }
        Update: {
          menu_id?: number
          recipe_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "menu_recipe_menu_fk"
            columns: ["menu_id"]
            isOneToOne: false
            referencedRelation: "menu"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_recipe_recipe_fk"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipe"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe: {
        Row: {
          active: boolean
          author_id: string | null
          created_at: string
          deleted_at: string | null
          description: string
          id: number
          is_ai_generated: boolean
          last_edit: string
          likes: number
          name: string
          saves: number
          servings: number
          time: number
        }
        Insert: {
          active?: boolean
          author_id?: string | null
          created_at?: string
          deleted_at?: string | null
          description: string
          id?: number
          is_ai_generated?: boolean
          last_edit?: string
          likes?: number
          name: string
          saves?: number
          servings: number
          time: number
        }
        Update: {
          active?: boolean
          author_id?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string
          id?: number
          is_ai_generated?: boolean
          last_edit?: string
          likes?: number
          name?: string
          saves?: number
          servings?: number
          time?: number
        }
        Relationships: [
          {
            foreignKeyName: "recipe_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_categories: {
        Row: {
          category_id: number
          recipe_id: number
        }
        Insert: {
          category_id: number
          recipe_id: number
        }
        Update: {
          category_id?: number
          recipe_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "recipe_categories_category_fk"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_categories_recipe_fk"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipe"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_ingredients: {
        Row: {
          ingredient_id: number
          quantity: number
          recipe_id: number
          unit: Database["public"]["Enums"]["unit"]
        }
        Insert: {
          ingredient_id: number
          quantity: number
          recipe_id: number
          unit: Database["public"]["Enums"]["unit"]
        }
        Update: {
          ingredient_id?: number
          quantity?: number
          recipe_id?: number
          unit?: Database["public"]["Enums"]["unit"]
        }
        Relationships: [
          {
            foreignKeyName: "recipe_ingredients_ingredient_fk"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredient"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_ingredients_recipe_fk"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipe"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_step: {
        Row: {
          recipe_id: number
          step_id: number
          step_number: number
        }
        Insert: {
          recipe_id: number
          step_id: number
          step_number: number
        }
        Update: {
          recipe_id?: number
          step_id?: number
          step_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "recipe_step_recipe_fk"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_step_step_fk"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "step"
            referencedColumns: ["step_id"]
          },
        ]
      }
      step: {
        Row: {
          step_description: string | null
          step_id: number
        }
        Insert: {
          step_description?: string | null
          step_id?: number
        }
        Update: {
          step_description?: string | null
          step_id?: number
        }
        Relationships: []
      }
      user: {
        Row: {
          active: boolean
          created_at: string
          deleted_at: string | null
          email: string
          id: string
          profile_url: string
          username: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          deleted_at?: string | null
          email: string
          id: string
          profile_url: string
          username: string
        }
        Update: {
          active?: boolean
          created_at?: string
          deleted_at?: string | null
          email?: string
          id?: string
          profile_url?: string
          username?: string
        }
        Relationships: []
      }
      user_allergy: {
        Row: {
          allergy_id: number
          user_id: string
        }
        Insert: {
          allergy_id: number
          user_id: string
        }
        Update: {
          allergy_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_allergy_allergy_fk"
            columns: ["allergy_id"]
            isOneToOne: false
            referencedRelation: "allergy"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_allergy_user_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      user_dislike: {
        Row: {
          ingredient_id: number
          user_id: string
        }
        Insert: {
          ingredient_id: number
          user_id: string
        }
        Update: {
          ingredient_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_dislike_ingredient_fk"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredient"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_dislike_user_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      user_ingredient: {
        Row: {
          expired: boolean
          expiry_date: string
          ingredient_id: number
          quantity: number
          unit: Database["public"]["Enums"]["unit"]
          user_id: string
        }
        Insert: {
          expired?: boolean
          expiry_date: string
          ingredient_id: number
          quantity: number
          unit: Database["public"]["Enums"]["unit"]
          user_id: string
        }
        Update: {
          expired?: boolean
          expiry_date?: string
          ingredient_id?: number
          quantity?: number
          unit?: Database["public"]["Enums"]["unit"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_ingredient_ingredient_fk"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredient"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_ingredient_user_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      user_recipe: {
        Row: {
          recipe_id: number
          saved: boolean | null
          tried: boolean | null
          user_id: string
        }
        Insert: {
          recipe_id: number
          saved?: boolean | null
          tried?: boolean | null
          user_id: string
        }
        Update: {
          recipe_id?: number
          saved?: boolean | null
          tried?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_recipe_recipe_fk"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_recipe_user_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_missing_ingredient_counts_for_range: {
        Args: { p_from: string; p_to: string; p_user_id: string }
        Returns: {
          day: string
          missing_count: number
        }[]
      }
      get_missing_ingredients_for_day: {
        Args: { p_day: string; p_user_id: string }
        Returns: {
          has_expired_stock: boolean
          ingredient_id: number
          ingredient_name: string
          required_quantity: number
          required_unit: Database["public"]["Enums"]["unit"]
        }[]
      }
      get_recommended_ingredients: {
        Args: { p_user_id: string }
        Returns: {
          appears: number
          name: string
        }[]
      }
      refresh_user_ingredient_expired_flag: { Args: never; Returns: undefined }
      refresh_user_ingredient_expired_flag_timestamptz: {
        Args: never
        Returns: number
      }
    }
    Enums: {
      group_types:
        | "meal_type"
        | "length"
        | "skill"
        | "ingredient_type"
        | "meal"
        | "type"
      ingredient_categories:
        | "meat"
        | "vegetable"
        | "grain"
        | "milk"
        | "milk_based"
        | "fruit"
        | "egg"
        | "fish"
        | "oil"
        | "nut"
        | "sugar"
        | "non_alcoholic"
        | "alcoholic"
      recipe_status: "tried" | "saved"
      unit:
        | "g"
        | "dkg"
        | "kg"
        | "ml"
        | "dl"
        | "l"
        | "tsp"
        | "tbsp"
        | "c"
        | "pt"
        | "qt"
        | "gal"
        | "oz"
        | "lb"
        | "db"
        | "csipet"
        | "csomag"
        | "gerezd"
        | "tk"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      group_types: [
        "meal_type",
        "length",
        "skill",
        "ingredient_type",
        "meal",
        "type",
      ],
      ingredient_categories: [
        "meat",
        "vegetable",
        "grain",
        "milk",
        "milk_based",
        "fruit",
        "egg",
        "fish",
        "oil",
        "nut",
        "sugar",
        "non_alcoholic",
        "alcoholic",
      ],
      recipe_status: ["tried", "saved"],
      unit: [
        "g",
        "dkg",
        "kg",
        "ml",
        "dl",
        "l",
        "tsp",
        "tbsp",
        "c",
        "pt",
        "qt",
        "gal",
        "oz",
        "lb",
        "db",
        "csipet",
        "csomag",
        "gerezd",
        "tk",
      ],
    },
  },
} as const
