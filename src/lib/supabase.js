import { createClient } from '@supabase/supabase-js'

// Publishable key is intentionally public. Never put service_role/secret keys in the browser.
export const supabase=createClient(
  import.meta.env.VITE_SUPABASE_URL||'https://cjwstgthibwmrgidsltu.supabase.co',
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY||'sb_publishable_DrBKLTXi85isU3WtVfOHYw_gwqdpw6e',
  {auth:{autoRefreshToken:true,persistSession:true,detectSessionInUrl:true}}
)
