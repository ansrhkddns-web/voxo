'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { PostInput, PostRecord, SearchPostResult } from '@/types/content';

interface SearchPostRow {
    title: string;
    slug: string;
    categories: Array<{ name: string }> | { name: string } | null;
}

export async function getPosts(): Promise<PostRecord[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('posts')
        .select('*, categories(name)')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []) as PostRecord[];
}

export async function getPostById(id: string): Promise<PostRecord> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('posts')
        .select('*, categories(name)')
        .eq('id', id)
        .single();

    if (error) throw error;
    return data as PostRecord;
}

export async function createPost(formData: PostInput): Promise<PostRecord> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
        .from('posts')
        .insert([{
            ...formData,
            author_id: user?.id
        }])
        .select()
        .single();

    if (error) throw error;
    revalidatePath('/admin');
    revalidatePath('/');
    return data as PostRecord;
}

export async function updatePost(id: string, formData: PostInput): Promise<PostRecord> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('posts')
        .update(formData)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    revalidatePath('/admin');
    revalidatePath(`/post/${data.slug}`);
    return data as PostRecord;
}

export async function deletePost(id: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id);

    if (error) throw error;
    revalidatePath('/admin');
}

export async function getPostBySlug(slug: string): Promise<PostRecord | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('posts')
        .select('*, categories(name)')
        .ilike('slug', slug)
        .eq('is_published', true)
        .maybeSingle();

    if (error) {
        console.error("Error fetching post by slug:", error);
        return null;
    }
    return data as PostRecord | null;
}

export async function searchPosts(query: string): Promise<SearchPostResult[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('posts')
        .select('title, slug, categories(name)')
        .or(`title.ilike.%${query}%,content.ilike.%${query}%,artist_name.ilike.%${query}%`)
        .eq('is_published', true)
        .limit(5);

    if (error) throw error;
    return ((data ?? []) as SearchPostRow[]).map((post) => ({
        title: post.title,
        slug: post.slug,
        categories: Array.isArray(post.categories) ? (post.categories[0] ?? null) : post.categories,
    }));
}

export async function incrementViewCount(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.rpc('increment_view_count', { post_id: id });

    // Fallback if RPC is not created yet
    if (error) {
        const { data } = await supabase.from('posts').select('view_count').eq('id', id).maybeSingle();
        if (data) {
            await supabase.from('posts').update({ view_count: (data.view_count || 0) + 1 }).eq('id', id);
        }
    }
}
