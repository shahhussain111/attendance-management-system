import "server-only";

import { resolveAuthenticatedUser } from "@/lib/supabase/auth-profile";
import { getSupabasePublicConfig, isSupabaseAuthEnabled } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export async function getAuthenticatedUser() {
  if (!isSupabaseAuthEnabled()) return null;

  const { organizationId } = getSupabasePublicConfig();
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) return null;

  try {
    return await resolveAuthenticatedUser(supabase, data.user, organizationId);
  } catch {
    return null;
  }
}
