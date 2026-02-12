import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

// Use env vars with hardcoded fallback for production builds
// These are PUBLIC anon keys (safe to embed in client-side code)
const supabaseUrl =
    process.env.EXPO_PUBLIC_SUPABASE_URL ||
    "https://vgsjpuxymtkkiaissrky.supabase.co";

const supabaseAnonKey =
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
    "sb_publishable_6D8ptLACddu7D5r2SN0LTQ_RQMtS15q";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
