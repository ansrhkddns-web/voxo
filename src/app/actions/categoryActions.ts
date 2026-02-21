'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getCategories() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

    if (error) throw error;
    return data;
}

export async function createCategory(name: string, slug: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('categories')
        .insert([{ name, slug }])
        .select()
        .single();

    if (error) throw error;
    revalidatePath('/admin/categories');
    return data;
}

export async function deleteCategory(id: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

    if (error) throw error;
    revalidatePath('/admin/categories');
}

export async function updateCategory(id: string, name: string, slug: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('categories')
        .update({ name, slug })
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    revalidatePath('/admin/categories');
    return data;
}
