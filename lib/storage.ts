import * as FileSystem from "expo-file-system";

import { supabase } from "./supabase";

/**
 * Upload a local image (file:// URI) to a Supabase Storage bucket.
 * Returns the public URL (best-effort) or null if the bucket isn't
 * configured.
 *
 * Buckets used by HopOn (create via Supabase dashboard or migrations):
 *   - "horse-photos"      public  read
 *   - "task-photos"       authenticated read
 *   - "avatars"           public  read
 */
export async function uploadImage(
  bucket: "horse-photos" | "task-photos" | "avatars",
  localUri: string,
  pathInBucket: string,
): Promise<string | null> {
  try {
    const base64 = await FileSystem.readAsStringAsync(localUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const buffer = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

    const { error } = await supabase.storage
      .from(bucket)
      .upload(pathInBucket, buffer, { contentType: "image/jpeg", upsert: true });
    if (error) throw error;

    const { data: pub } = supabase.storage.from(bucket).getPublicUrl(pathInBucket);
    return pub.publicUrl ?? null;
  } catch (e) {
    console.warn("[storage] upload failed", e);
    return null;
  }
}
