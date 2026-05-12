// Supabase Edge Function: send-notification
//
// Inserts a `notifications` row and dispatches Expo push messages to all
// device_tokens for the target user(s). Intended to be invoked from other
// Edge Functions (post-payment, lesson reminders, urgent task triggers).
//
// Deploy:
//   supabase functions deploy send-notification
// Caller authentication is the service-role key if invoked from another
// Edge Function. Otherwise pass an Authorization header with the user JWT;
// they can only target their own user_id row.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.46.1";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

const admin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Payload = {
  userIds: string[];
  barnId?: string;
  type: string;          // e.g. "task_urgent" | "lesson_reminder" | "payment_received"
  title: string;
  body?: string;
  data?: Record<string, unknown>;
  /** If true, respect each user's quiet hours. Default true. */
  respectQuietHours?: boolean;
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const payload = (await req.json()) as Payload;
    if (!payload.userIds?.length || !payload.title) {
      return json({ error: "userIds and title are required." }, 400);
    }

    // 1. Insert notifications rows (one per user)
    const rows = payload.userIds.map((u) => ({
      user_id: u,
      barn_id: payload.barnId ?? null,
      type: payload.type,
      title: payload.title,
      body: payload.body ?? null,
      data: payload.data ?? {},
    }));
    const { error: insErr } = await admin.from("notifications").insert(rows);
    if (insErr) console.warn("[send-notification] insert failed", insErr.message);

    // 2. Resolve push tokens (respecting quiet hours)
    const respectQH = payload.respectQuietHours !== false;
    const { data: profiles, error: profErr } = await admin
      .from("profiles")
      .select("id, notifications_quiet_start, notifications_quiet_end")
      .in("id", payload.userIds);
    if (profErr) return json({ error: profErr.message }, 500);

    const targets = (profiles ?? []).filter((p) =>
      respectQH ? !isQuietNow(p.notifications_quiet_start, p.notifications_quiet_end) : true,
    );

    const { data: tokens, error: tokErr } = await admin
      .from("device_tokens")
      .select("expo_push_token, user_id")
      .in("user_id", targets.map((t) => t.id));
    if (tokErr) return json({ error: tokErr.message }, 500);

    if (!tokens || tokens.length === 0) {
      return json({ ok: true, pushed: 0, notice: "no devices or all in quiet hours" });
    }

    // 3. Dispatch to Expo (batches of 100, fire-and-forget)
    const messages = tokens.map((t) => ({
      to: t.expo_push_token,
      title: payload.title,
      body: payload.body ?? "",
      data: payload.data ?? {},
      sound: "default",
      channelId: payload.type === "task_urgent" ? "urgent" : "default",
    }));

    const res = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(messages),
    });
    const result = await res.json().catch(() => null);

    return json({ ok: true, pushed: messages.length, expo: result });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return json({ error: message }, 500);
  }
});

function isQuietNow(start: string | null, end: string | null): boolean {
  if (!start || !end) return false;
  const now = new Date();
  const cur = now.getHours() * 60 + now.getMinutes();
  const toMin = (s: string) => {
    const [h, m] = s.split(":").map(Number);
    return (h ?? 0) * 60 + (m ?? 0);
  };
  const s = toMin(start);
  const e = toMin(end);
  // Quiet window can wrap midnight (22:00 → 07:00)
  return s > e ? cur >= s || cur < e : cur >= s && cur < e;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
