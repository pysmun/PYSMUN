import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null | undefined;

// Browser client for the admin console. Uses only the public URL and anon key;
// all data access is gated by Supabase Auth + row-level security.
export function getSupabaseBrowserClient() {
  if (client !== undefined) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  client = url && anonKey ? createClient(url, anonKey) : null;
  return client;
}

export function supabaseDashboardUrl() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const projectRef = url?.match(/^https:\/\/([a-z0-9]+)\.supabase\.co/)?.[1];
  return projectRef ? `https://supabase.com/dashboard/project/${projectRef}` : null;
}
