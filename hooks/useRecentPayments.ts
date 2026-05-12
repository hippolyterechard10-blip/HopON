import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";

export type PaymentRow = {
  id: string;
  amount_cents: number;
  currency: string;
  status: string;
  is_prepayment: boolean;
  paid_at: string | null;
  created_at: string;
  payer: { id: string; full_name: string } | null;
  lesson: { id: string; starts_at: string; horse: { name: string } | null } | null;
};

export function useRecentPayments(barnId: string | null | undefined, limit = 20) {
  return useQuery({
    queryKey: ["recentPayments", barnId, limit],
    enabled: Boolean(barnId),
    queryFn: async (): Promise<PaymentRow[]> => {
      const { data, error } = await supabase
        .from("payments")
        .select(
          "id, amount_cents, currency, status, is_prepayment, paid_at, created_at, payer:payer_id(id,full_name), lesson:lessons(id, starts_at, horse:horses(name))",
        )
        .eq("barn_id", barnId!)
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []) as unknown as PaymentRow[];
    },
  });
}
