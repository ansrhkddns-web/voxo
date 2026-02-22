'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

// Fetch a single setting value by key
export async function getSetting(key: string) {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('site_settings')
            .select('setting_value')
            .eq('setting_key', key)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            console.error(`Error fetching setting ${key}:`, error);
            return null;
        }

        return data?.setting_value || null;
    } catch (e) {
        console.error('getSetting error:', e);
        return null;
    }
}

// Fetch multiple settings at once
export async function getAllSettings() {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('site_settings')
            .select('setting_key, setting_value');

        if (error) {
            console.error('Error fetching all settings:', error);
            return [];
        }

        return data || [];
    } catch (e) {
        console.error('getAllSettings error:', e);
        return [];
    }
}

// Update or create a setting
export async function updateSetting(key: string, value: string) {
    try {
        const supabase = await createClient();

        // Upsert the setting
        const { error } = await supabase
            .from('site_settings')
            .upsert({
                setting_key: key,
                setting_value: value,
                updated_at: new Date().toISOString()
            }, { onConflict: 'setting_key' });

        if (error) {
            console.error(`Error updating setting ${key}:`, error);
            return { success: false, error: error.message };
        }

        // Revalidate entire site or specific paths to bust cache for settings
        revalidatePath('/', 'layout');

        return { success: true };
    } catch (e) {
        console.error('updateSetting error:', e);
        return { success: false, error: 'Internal Server Error' };
    }
}
