'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getTags() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('menu_order', { ascending: true })
        .order('name');

    if (error) throw error;
    return data;
}

export async function getMenuTags() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('tags')
        .select('*')
        .eq('show_in_menu', true)
        .order('menu_order', { ascending: true })
        .order('name');

    if (error) throw error;
    return data;
}

export async function createTag(name: string, slug: string, showInMenu: boolean = false, menuOrder: number = 0) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('tags')
        .insert([{ name, slug, show_in_menu: showInMenu, menu_order: menuOrder }])
        .select()
        .single();

    if (error) throw error;
    revalidatePath('/admin/tags');
    revalidatePath('/');
    return data;
}

export async function updateTag(id: string, name: string, slug: string, showInMenu: boolean, menuOrder: number) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('tags')
        .update({ name, slug, show_in_menu: showInMenu, menu_order: menuOrder })
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    revalidatePath('/admin/tags');
    revalidatePath('/');
    return data;
}

export async function deleteTag(id: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', id);

    if (error) throw error;
    revalidatePath('/admin/tags');
    revalidatePath('/');
}
