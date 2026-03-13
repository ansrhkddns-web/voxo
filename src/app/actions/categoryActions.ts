'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { CACHE_TAGS } from '@/lib/cache-tags';
import type { CategoryRecord } from '@/types/content';

interface CategoryUsageRow extends CategoryRecord {
    postCount: number;
}

function normalizeCategorySlug(value: string) {
    return value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9가-힣\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export async function getCategories() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

    if (error) throw error;
    return data;
}

export async function getCategoryManagementData(): Promise<CategoryUsageRow[]> {
    const supabase = await createClient();
    const [{ data: categories, error: categoryError }, { data: posts, error: postError }] = await Promise.all([
        supabase.from('categories').select('*').order('name'),
        supabase.from('posts').select('category_id'),
    ]);

    if (categoryError) throw categoryError;
    if (postError) throw postError;

    const countMap = new Map<string, number>();
    for (const post of posts ?? []) {
        const categoryId = post.category_id as string | null;
        if (!categoryId) continue;
        countMap.set(categoryId, (countMap.get(categoryId) ?? 0) + 1);
    }

    return ((categories ?? []) as CategoryRecord[]).map((category) => ({
        ...category,
        postCount: countMap.get(category.id) ?? 0,
    }));
}

export async function createCategory(name: string, slug: string) {
    const supabase = await createClient();
    const normalizedName = name.trim();
    const normalizedSlug = normalizeCategorySlug(slug || name);

    if (!normalizedName) {
        throw new Error('Category name is required');
    }

    const { data: existingCategory } = await supabase
        .from('categories')
        .select('id')
        .or(`name.ilike.${normalizedName},slug.eq.${normalizedSlug}`)
        .maybeSingle();

    if (existingCategory) {
        throw new Error('Category already exists');
    }

    const { data, error } = await supabase
        .from('categories')
        .insert([{ name: normalizedName, slug: normalizedSlug }])
        .select()
        .single();

    if (error) throw error;
    revalidateTag(CACHE_TAGS.posts, 'max');
    revalidatePath('/admin/categories');
    return data;
}

export async function deleteCategory(id: string) {
    const supabase = await createClient();
    const { count, error: countError } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', id);

    if (countError) throw countError;
    if ((count ?? 0) > 0) {
        throw new Error('Category is still being used by posts');
    }

    const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

    if (error) throw error;
    revalidateTag(CACHE_TAGS.posts, 'max');
    revalidatePath('/admin/categories');
}

export async function updateCategory(id: string, name: string, slug: string) {
    const supabase = await createClient();
    const normalizedName = name.trim();
    const normalizedSlug = normalizeCategorySlug(slug || name);

    if (!normalizedName) {
        throw new Error('Category name is required');
    }

    const { data: duplicateCategory } = await supabase
        .from('categories')
        .select('id')
        .neq('id', id)
        .or(`name.ilike.${normalizedName},slug.eq.${normalizedSlug}`)
        .maybeSingle();

    if (duplicateCategory) {
        throw new Error('Category already exists');
    }

    const { data, error } = await supabase
        .from('categories')
        .update({ name: normalizedName, slug: normalizedSlug })
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    revalidateTag(CACHE_TAGS.posts, 'max');
    revalidatePath('/admin/categories');
    return data;
}
