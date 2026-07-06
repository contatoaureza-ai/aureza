import { createClient } from "@supabase/supabase-js";

// Placeholders evitam que o app inteiro quebre antes das variáveis de ambiente
// serem configuradas (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY em .env.local) —
// chamadas de auth/dados simplesmente falharão até lá.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "placeholder-anon-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
