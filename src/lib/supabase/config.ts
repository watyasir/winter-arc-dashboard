/*
  Where the app finds Supabase. Env vars win; the defaults below are the live project's
  public values. The publishable key is meant to be public (it ships to every browser
  anyway); row-level security is what keeps data private. Never put the secret key here.
*/
const DEFAULT_URL = "https://tlxifgjnjaxzmesbregz.supabase.co";
const DEFAULT_PUBLISHABLE_KEY = "sb_publishable_gkI9YycpHYBU2x3CPKe4uA_-zXLIOht";

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_URL;
export const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_PUBLISHABLE_KEY;
