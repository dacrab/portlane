export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      comments: {
        Row: {
          author_id: string
          body: string
          created_at: string
          id: string
          project_id: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          id?: string
          project_id: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          id?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      files: {
        Row: {
          created_at: string
          id: string
          name: string
          project_id: string
          size_bytes: number | null
          storage_path: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          project_id: string
          size_bytes?: number | null
          storage_path: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          project_id?: string
          size_bytes?: number | null
          storage_path?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "files_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount_cents: number
          client_id: string
          created_at: string
          currency: string
          due_date: string | null
          freelancer_id: string
          id: string
          project_id: string
          status: string
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
        }
        Insert: {
          amount_cents: number
          client_id: string
          created_at?: string
          currency?: string
          due_date?: string | null
          freelancer_id: string
          id?: string
          project_id: string
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
        }
        Update: {
          amount_cents?: number
          client_id?: string
          created_at?: string
          currency?: string
          due_date?: string | null
          freelancer_id?: string
          id?: string
          project_id?: string
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_freelancer_id_fkey"
            columns: ["freelancer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      milestones: {
        Row: {
          completed: boolean
          created_at: string
          id: string
          name: string
          position: number
          project_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          id?: string
          name: string
          position?: number
          project_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          id?: string
          name?: string
          position?: number
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "milestones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          last_read_comments_at: string | null
          role: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          last_read_comments_at?: string | null
          role?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          last_read_comments_at?: string | null
          role?: string
        }
        Relationships: []
      }
      project_clients: {
        Row: {
          client_id: string
          project_id: string
        }
        Insert: {
          client_id: string
          project_id: string
        }
        Update: {
          client_id?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_clients_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_clients_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_notes: {
        Row: {
          body: string
          id: string
          project_id: string
          updated_at: string
        }
        Insert: {
          body: string
          id?: string
          project_id: string
          updated_at?: string
        }
        Update: {
          body?: string
          id?: string
          project_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_notes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          description: string | null
          due_date: string | null
          freelancer_id: string
          id: string
          name: string
          status: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          freelancer_id: string
          id?: string
          name: string
          status?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          freelancer_id?: string
          id?: string
          name?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_freelancer_id_fkey"
            columns: ["freelancer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      time_entries: {
        Row: {
          created_at: string
          description: string | null
          id: string
          logged_at: string
          minutes: number
          project_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          logged_at?: string
          minutes: number
          project_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          logged_at?: string
          minutes?: number
          project_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_milestone: {
        Args: { p_name: string; p_project_id: string }
        Returns: undefined
      }
      approve_project: {
        Args: { p_note?: string; p_project_id: string }
        Returns: undefined
      }
      create_invoice: {
        Args: {
          p_amount_dollars: number
          p_client_id: string
          p_due_date?: string
          p_project_id: string
        }
        Returns: string
      }
      delete_invoice: { Args: { p_invoice_id: string }; Returns: undefined }
      get_activity_feed: {
        Args: { p_limit?: number; p_user_id: string }
        Returns: {
          author_name: string
          body: string
          created_at: string
          project_id: string
          project_name: string
        }[]
      }
      get_dashboard_stats: {
        Args: { p_user_id: string }
        Returns: {
          active_projects: number
          completed_projects: number
          revenue_mtd: number
          review_projects: number
          total_clients: number
          total_invoices: number
        }[]
      }
      get_freelancer_clients: {
        Args: { p_user_id: string }
        Returns: {
          client_id: string
          full_name: string
          projects: string[]
        }[]
      }
      get_unread_comment_count: { Args: { p_user_id: string }; Returns: number }
      get_unread_comments: {
        Args: { p_user_id: string }
        Returns: {
          author_name: string
          body: string
          created_at: string
          id: string
          project_id: string
          project_name: string
        }[]
      }
      is_project_client: { Args: { p_project_id: string }; Returns: boolean }
      mark_comments_read: { Args: never; Returns: undefined }
      request_revision: {
        Args: { p_note?: string; p_project_id: string }
        Returns: undefined
      }
      update_invoice_status: {
        Args: { p_invoice_id: string; p_status: string }
        Returns: undefined
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



