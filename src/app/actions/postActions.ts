'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { hasValidDefaultAdminSession } from '@/lib/admin-auth-server';
import { revalidatePath } from 'next/cache';
import type { PostInput, PostRecord, SearchPostResult } from '@/types/content';

interface SearchPostRow {
    title: string;
    slug: string;
    categories: Array<{ name: string }> | { name: string } | null;
}

interface SupabaseColumnError {
    code?: string;
    message?: string;
}

function normalizeRelatedCategories(
    categories: Array<{ name: string }> | { name: string } | null
) {
    return Array.isArray(categories) ? (categories[0] ?? null) : categories;
}

async function getPostWriteClient() {
    const supabase = await createClient();
    const [{ data: { user } }, hasDefaultAdminSession] = await Promise.all([
        supabase.auth.getUser(),
        hasValidDefaultAdminSession(),
    ]);

    if (user) {
        return { client: supabase, userId: user.id ?? null, usedServiceRole: false };
    }

    if (hasDefaultAdminSession) {
        const adminClient = createAdminClient();
        if (adminClient) {
            return { client: adminClient, userId: null, usedServiceRole: true };
        }

        throw new Error(
            '기본 관리자 로그인으로는 Supabase 쓰기 권한이 부족합니다. .env.local에 SUPABASE_SERVICE_ROLE_KEY를 추가해 주세요.'
        );
    }

    return { client: supabase, userId: null, usedServiceRole: false };
}

async function getPublishedPostsOrdered(limit: number) {
    const supabase = await createClient();

    const publishedAtQuery = await supabase
        .from('posts')
        .select('*, categories(name)')
        .eq('is_published', true)
        .order('published_at', { ascending: false })
        .limit(limit);

    if (!publishedAtQuery.error) {
        return (publishedAtQuery.data ?? []) as PostRecord[];
    }

    const columnError = publishedAtQuery.error as SupabaseColumnError;
    if (columnError.code !== '42703') {
        throw publishedAtQuery.error;
    }

    const createdAtQuery = await supabase
        .from('posts')
        .select('*, categories(name)')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (createdAtQuery.error) {
        throw createdAtQuery.error;
    }

    return (createdAtQuery.data ?? []) as PostRecord[];
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
    const { client, userId } = await getPostWriteClient();

    const { data, error } = await client
        .from('posts')
        .insert([{
            ...formData,
            author_id: userId
        }])
        .select()
        .single();

    if (error) throw error;
    revalidatePath('/admin');
    revalidatePath('/');
    return data as PostRecord;
}

export async function updatePost(id: string, formData: PostInput): Promise<PostRecord> {
    const { client } = await getPostWriteClient();

    const { data, error } = await client
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
    const { client } = await getPostWriteClient();
    const { error } = await client
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
        categories: normalizeRelatedCategories(post.categories),
    }));
}

export async function getRelatedPosts(slug: string, limit = 3): Promise<PostRecord[]> {
    const currentPost = await getPostBySlug(slug);
    if (!currentPost) {
        return [];
    }

    const candidates = (await getPublishedPostsOrdered(18)).filter(
        (post) => post.slug !== currentPost.slug
    );
    const currentTags = new Set(currentPost.tags ?? []);
    const currentCategory = currentPost.category_id;

    return candidates
        .map((post) => {
            const sharedTags = (post.tags ?? []).filter((tag) => currentTags.has(tag)).length;
            const sameCategory = post.category_id && currentCategory && post.category_id === currentCategory ? 2 : 0;
            const viewScore = Math.min((post.view_count ?? 0) / 100, 3);
            return {
                post,
                score: sharedTags * 3 + sameCategory + viewScore,
            };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map((item) => item.post);
}

export async function getAdjacentPublishedPosts(slug: string): Promise<{
    previous: PostRecord | null;
    next: PostRecord | null;
}> {
    const currentPost = await getPostBySlug(slug);
    if (!currentPost) {
        return { previous: null, next: null };
    }

    const posts = await getPublishedPostsOrdered(50);
    const currentIndex = posts.findIndex((post) => post.slug === currentPost.slug);

    if (currentIndex === -1) {
        return { previous: null, next: null };
    }

    return {
        previous: posts[currentIndex + 1] ?? null,
        next: posts[currentIndex - 1] ?? null,
    };
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
