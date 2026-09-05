export type SupabasePublicConfig = {
  url: string;
  publishableKey: string;
  organizationId: string;
};

export const isSupabaseAuthEnabled = () =>
  process.env.NEXT_PUBLIC_SUPABASE_AUTH_ENABLED === "true";

export function getSupabasePublicConfig(): SupabasePublicConfig {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const organizationId = process.env.NEXT_PUBLIC_SUPABASE_ORGANIZATION_ID;

  if (!url || !publishableKey || !organizationId) {
    throw new Error(
      "Supabase Auth requires NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, and NEXT_PUBLIC_SUPABASE_ORGANIZATION_ID.",
    );
  }

  return { url, publishableKey, organizationId };
}
