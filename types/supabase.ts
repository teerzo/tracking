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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      companies: {
        Row: {
          abn: string | null
          address: string | null
          contact_name: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
        }
        Insert: {
          abn?: string | null
          address?: string | null
          contact_name?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
        }
        Update: {
          abn?: string | null
          address?: string | null
          contact_name?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
        }
        Relationships: []
      }
      invoices: {
        Row: {
          created_at: string
          id: string
          invoice_number: string | null
          period_end: string
          period_start: string
          status: string
          total_amount: number
          total_hours: number
        }
        Insert: {
          created_at?: string
          id?: string
          invoice_number?: string | null
          period_end: string
          period_start: string
          status?: string
          total_amount?: number
          total_hours?: number
        }
        Update: {
          created_at?: string
          id?: string
          invoice_number?: string | null
          period_end?: string
          period_start?: string
          status?: string
          total_amount?: number
          total_hours?: number
        }
        Relationships: []
      }
      projects: {
        Row: {
          company_id: string
          end_date: string | null
          hourly_rate: number
          id: string
          project_name: string
          start_date: string | null
        }
        Insert: {
          company_id: string
          end_date?: string | null
          hourly_rate?: number
          id?: string
          project_name: string
          start_date?: string | null
        }
        Update: {
          company_id?: string
          end_date?: string | null
          hourly_rate?: number
          id?: string
          project_name?: string
          start_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      time: {
        Row: {
          client_offset_minutes: number | null
          date: string
          date_created: string
          hours: number
          id: string
          notes: string | null
          project_id: string
          time_zone: string | null
        }
        Insert: {
          client_offset_minutes?: number | null
          date: string
          date_created?: string
          hours: number
          id?: string
          notes?: string | null
          project_id: string
          time_zone?: string | null
        }
        Update: {
          client_offset_minutes?: number | null
          date?: string
          date_created?: string
          hours?: number
          id?: string
          notes?: string | null
          project_id?: string
          time_zone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "time_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          charge_gst: boolean
          gst_amount: number
          user_id: string
        }
        Insert: {
          charge_gst?: boolean
          gst_amount?: number
          user_id: string
        }
        Update: {
          charge_gst?: boolean
          gst_amount?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          abn: string | null
          account_number: string | null
          address: string | null
          billing_email: string | null
          bsb: string | null
          email: string
          family_name: string | null
          given_name: string | null
          id: string
          mobile: string | null
        }
        Insert: {
          abn?: string | null
          account_number?: string | null
          address?: string | null
          billing_email?: string | null
          bsb?: string | null
          email: string
          family_name?: string | null
          given_name?: string | null
          id: string
          mobile?: string | null
        }
        Update: {
          abn?: string | null
          account_number?: string | null
          address?: string | null
          billing_email?: string | null
          bsb?: string | null
          email?: string
          family_name?: string | null
          given_name?: string | null
          id?: string
          mobile?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_time_entry: {
        Args: {
          p_client_offset_minutes?: number
          p_date: string
          p_hours: number
          p_notes?: string
          p_project_id: string
          p_time_zone?: string
        }
        Returns: {
          client_offset_minutes: number | null
          date: string
          date_created: string
          hours: number
          id: string
          notes: string | null
          project_id: string
          time_zone: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "time"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      create_user: {
        Args: {
          clinic_id: string
          email: string
          family_name: string
          given_name: string
          password: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
