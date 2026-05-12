import * as Linking from "expo-linking";

import { supabase } from "./supabase";

/**
 * Auth helpers — thin wrappers around supabase.auth that return shaped
 * results so screens can reason about errors without `any`.
 */

export type AuthResult = { ok: true } | { ok: false; message: string };

function shapedError(message: string | undefined | null): AuthResult {
  return { ok: false, message: message ?? "Something went wrong. Try again." };
}

export async function signInWithMagicLink(email: string): Promise<AuthResult> {
  const redirectTo = Linking.createURL("/auth-callback");
  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim().toLowerCase(),
    options: { emailRedirectTo: redirectTo },
  });
  return error ? shapedError(error.message) : { ok: true };
}

export async function signInWithPassword(email: string, password: string): Promise<AuthResult> {
  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
  return error ? shapedError(error.message) : { ok: true };
}

export async function signUpWithPassword(email: string, password: string): Promise<AuthResult> {
  const redirectTo = Linking.createURL("/auth-callback");
  const { error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: { emailRedirectTo: redirectTo },
  });
  return error ? shapedError(error.message) : { ok: true };
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}
