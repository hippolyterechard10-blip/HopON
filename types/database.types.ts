/**
 * Placeholder for the Supabase-generated database types.
 *
 * Regenerate against a live project with:
 *   supabase gen types typescript --project-id <ref> > types/database.types.ts
 *
 * Or against a local Supabase stack:
 *   supabase gen types typescript --local > types/database.types.ts
 *
 * Until then we expose a permissive Database shape so the typed client
 * compiles without inferring `never` for every table operation.
 */

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

type AnyRow = Record<string, unknown>;
type AnyTable = {
  Row: AnyRow;
  Insert: AnyRow;
  Update: AnyRow;
  Relationships: never[];
};

export type Database = {
  public: {
    Tables: {
      [key: string]: AnyTable;
    };
    Views: {
      [key: string]: { Row: AnyRow };
    };
    Functions: {
      [key: string]: {
        Args: AnyRow;
        Returns: unknown;
      };
    };
    Enums: { [key: string]: string };
    CompositeTypes: { [key: string]: AnyRow };
  };
};
