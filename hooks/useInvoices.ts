import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";

export type InvoiceRow = {
  id: string;
  status: string;
  subtotal_cents: number;
  tax_cents: number;
  total_cents: number;
  due_date: string | null;
  paid_at: string | null;
  notes: string | null;
  created_at: string;
  client: { id: string; full_name: string } | null;
};

/**
 * Owner-side: all invoices for the barn.
 * Client-side: only their own invoices (enforced by RLS).
 */
export function useInvoices(barnId: string | null | undefined) {
  return useQuery({
    queryKey: ["invoices", barnId],
    enabled: Boolean(barnId),
    queryFn: async (): Promise<InvoiceRow[]> => {
      const { data, error } = await supabase
        .from("invoices")
        .select(
          "id, status, subtotal_cents, tax_cents, total_cents, due_date, paid_at, notes, created_at, client:client_id(id,full_name)",
        )
        .eq("barn_id", barnId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as InvoiceRow[];
    },
  });
}

export function useMyInvoices() {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: ["myInvoices", userId],
    enabled: Boolean(userId),
    queryFn: async (): Promise<InvoiceRow[]> => {
      const { data, error } = await supabase
        .from("invoices")
        .select(
          "id, status, subtotal_cents, tax_cents, total_cents, due_date, paid_at, notes, created_at, client:client_id(id,full_name)",
        )
        .eq("client_id", userId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as InvoiceRow[];
    },
  });
}
