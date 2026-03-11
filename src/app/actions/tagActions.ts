'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { TagRecord } from '@/types/content';

interface TagUsageRow extends TagRecord {
    postCount: number;
}

function normalizeTagSlug(value: string) {
    return value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9가-힣\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
}

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

export async function getTagManagementData(): Promise<TagUsageRow[]> {
    const supabase = await createClient();
    const [{ data: tags, error: tagError }, { data: posts, error: postError }] = await Promise.all([
        supabase
            .from('tags')
            .select('*')
            .order('menu_order', { ascending: true })
            .order('name'),
        supabase.from('posts').select('tags'),
    ]);

    if (tagError) throw tagError;
    if (postError) throw postError;

    const countMap = new Map<string, number>();
    for (const post of posts ?? []) {
        const postTags = Array.isArray(post.tags) ? (post.tags as string[]) : [];
        for (const tagName of postTags) {
            countMap.set(tagName, (countMap.get(tagName) ?? 0) + 1);
        }
    }

    return ((tags ?? []) as TagRecord[]).map((tag) => ({
        ...tag,
        postCount: countMap.get(tag.name) ?? 0,
    }));
}

export async function createTag(name: string, slug: string, showInMenu: boolean = false, menuOrder: number = 0) {
    const supabase = await createClient();
    const normalizedName = name.trim();
    const normalizedSlug = normalizeTagSlug(slug || name);

    if (!normalizedName) {
        throw new Error('Tag name is required');
    }

    const { data: existingTag } = await supabase
        .from('tags')
        .select('id')
        .or(`name.ilike.${normalizedName},slug.eq.${normalizedSlug}`)
        .maybeSingle();

    if (existingTag) {
        throw new Error('Tag already exists');
    }

    const { data, error } = await supabase
        .from('tags')
        .insert([{ name: normalizedName, slug: normalizedSlug, show_in_menu: showInMenu, menu_order: menuOrder }])
        .select()
        .single();

    if (error) throw error;
    revalidatePath('/admin/tags');
    revalidatePath('/');
    return data;
}

export async function updateTag(id: string, name: string, slug: string, showInMenu: boolean, menuOrder: number) {
    const supabase = await createClient();
    const normalizedName = name.trim();
    const normalizedSlug = normalizeTagSlug(slug || name);

    if (!normalizedName) {
        throw new Error('Tag name is required');
    }

    const { data: duplicateTag } = await supabase
        .from('tags')
        .select('id')
        .neq('id', id)
        .or(`name.ilike.${normalizedName},slug.eq.${normalizedSlug}`)
        .maybeSingle();

    if (duplicateTag) {
        throw new Error('Tag already exists');
    }

    const { data, error } = await supabase
        .from('tags')
        .update({
            name: normalizedName,
            slug: normalizedSlug,
            show_in_menu: showInMenu,
            menu_order: menuOrder,
        })
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    revalidatePath('/admin/tags');
    revalidatePath('/');
    return data;
}

export async function bulkSetTagMenuVisibility(ids: string[], showInMenu: boolean) {
    if (ids.length === 0) {
        return { updatedCount: 0 };
    }

    const supabase = await createClient();
    const { error } = await supabase
        .from('tags')
        .update({ show_in_menu: showInMenu })
        .in('id', ids);

    if (error) throw error;
    revalidatePath('/admin/tags');
    revalidatePath('/');
    return { updatedCount: ids.length };
}

export async function bulkDeleteUnusedTags(ids: string[]) {
    if (ids.length === 0) {
        return { deletedCount: 0, blockedNames: [] as string[] };
    }

    const supabase = await createClient();
    const { data: tags, error: tagError } = await supabase
        .from('tags')
        .select('id, name')
        .in('id', ids);

    if (tagError) throw tagError;

    const { data: posts, error: postError } = await supabase
        .from('posts')
        .select('tags');

    if (postError) throw postError;

    const usedTagNames = new Set<string>();
    for (const post of posts ?? []) {
        const postTags = Array.isArray(post.tags) ? (post.tags as string[]) : [];
        for (const tagName of postTags) {
            usedTagNames.add(tagName);
        }
    }

    const deletableIds: string[] = [];
    const blockedNames: string[] = [];

    for (const tag of tags ?? []) {
        if (usedTagNames.has(tag.name)) {
            blockedNames.push(tag.name);
        } else {
            deletableIds.push(tag.id);
        }
    }

    if (deletableIds.length > 0) {
        const { error } = await supabase
            .from('tags')
            .delete()
            .in('id', deletableIds);

        if (error) throw error;
    }

    revalidatePath('/admin/tags');
    revalidatePath('/');
    return { deletedCount: deletableIds.length, blockedNames };
}

export async function deleteTag(id: string) {
    const supabase = await createClient();
    const { data: tag, error: tagError } = await supabase
        .from('tags')
        .select('name')
        .eq('id', id)
        .single();

    if (tagError) throw tagError;

    const { data: posts, error: postError } = await supabase
        .from('posts')
        .select('id, tags');

    if (postError) throw postError;

    const isTagInUse = (posts ?? []).some((post) =>
        Array.isArray(post.tags) && (post.tags as string[]).includes(tag.name)
    );

    if (isTagInUse) {
        throw new Error('Tag is still being used by posts');
    }

    const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', id);

    if (error) throw error;
    revalidatePath('/admin/tags');
    revalidatePath('/');
}
