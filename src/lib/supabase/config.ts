export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

/**
 * The admin is the only thing that needs Supabase Auth, and it is added after the
 * customer side already works. Until the keys are filled in, the admin says so plainly
 * instead of throwing, and nothing on the customer side is affected either way.
 */
export function isSupabaseConfigured(): boolean {
  return SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0;
}
