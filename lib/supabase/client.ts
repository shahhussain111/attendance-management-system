"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublicConfig } from "@/lib/supabase/config";

let browserClient: ReturnType<typeof createBrowserClient> | undefined;

export function createClient() {
  const { url, publishableKey } = getSupabasePublicConfig();

  browserClient ??= createBrowserClient(url, publishableKey);
  return browserClient;
}
