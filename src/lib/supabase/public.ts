import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let publicClient: SupabaseClient | null = null;

export function createPublicClient() {
    if (publicClient) {
        return publicClient;
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
        throw new Error('Public Supabase environment variables are missing.');
    }

    publicClient = createClient(url, anonKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });

    return publicClient;
}
