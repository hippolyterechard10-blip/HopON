/**
 * Placeholder for the Supabase-generated database types.
 *
 * Regenerate with:
 *   supabase gen types typescript --local > types/database.types.ts
 *
 * Until then we expose a minimal Database shape so the client compiles.
 */

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type Database = {
  public: {
    Tables: Record<string, { Row: Record<string, unknown> }>;
    Views: Record<string, { Row: Record<string, unknown> }>;
    Functions: Record<string, unknown>;
    Enums: Record<string, unknown>;
  };
};
