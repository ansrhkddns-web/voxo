'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { hasValidDefaultAdminSession } from '@/lib/admin-auth-server';
import { revalidatePath } from 'next/cache';
import { generatePostSlug } from '@/features/admin-editor/utils';
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

export interface PostRevisionEntry {
    id: string;
    savedAt: string;
    sourcePostId: string;
    title: string;
    slug: string;
    content: string | null;
    category_id: string | null;
    spotify_uri: string | null;
    cover_image: string | null;
    rating: number | null;
    artist_name: string | null;
    tags: string[] | null;
    is_published: boolean;
}

type PersistedPostPayload = Omit<PostInput, 'content' | 'category_id' | 'spotify_uri' | 'cover_image' | 'artist_name' | 'tags'> & {
    content: string | null;
    category_id: string | null;
    spotify_uri: string | null;
    cover_image: string | null;
    artist_name: string | null;
    tags: string[] | null;
    author_id?: string | null;
    published_at?: string | null;
};

const POST_REVISION_LIMIT = 12;

function normalizeRelatedCategories(
    categories: Array<{ name: string }> | { name: string } | null
) {
    return Array.isArray(categories) ? (categories[0] ?? null) : categories;
}

function getPostRevisionSettingKey(postId: string) {
    return `post_revisions:${postId}`;
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

function isMissingColumnError(error: unknown, columnName: string) {
    const columnError = error as SupabaseColumnError | null;
    return (
        columnError?.code === '42703' &&
        columnError?.message?.toLowerCase().includes(columnName.toLowerCase())
    );
}

async function buildUniquePostSlug(
    client: Awaited<ReturnType<typeof getPostWriteClient>>['client'],
    title: string,
    preferredSlug?: string,
    excludePostId?: string
) {
    const initialSlug = preferredSlug?.trim() || generatePostSlug(title);
    let nextSlug = initialSlug;
    let attempt = 0;

    while (attempt < 5) {
        let query = client
            .from('posts')
            .select('id')
            .eq('slug', nextSlug)
            .limit(1);

        if (excludePostId) {
            query = query.neq('id', excludePostId);
        }

        const { data, error } = await query;
        if (error) {
            throw error;
        }

        if (!data || data.length === 0) {
            return nextSlug;
        }

        nextSlug = generatePostSlug(title);
        attempt += 1;
    }

    return `${initialSlug}-${Date.now()}`;
}

async function revalidatePostSurfaces(post: PostRecord, previousSlug?: string | null) {
    revalidatePath('/admin');
    revalidatePath('/admin/posts');
    revalidatePath('/');
    revalidatePath(`/post/${post.slug}`);

    if (previousSlug && previousSlug !== post.slug) {
        revalidatePath(`/post/${previousSlug}`);
    }
}

async function getPostRevisionHistoryInternal(postId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('setting_key', getPostRevisionSettingKey(postId))
        .maybeSingle();

    if (error) {
        console.error('Failed to load post revision history', error);
        return [] as PostRevisionEntry[];
    }

    if (!data?.setting_value) {
        return [];
    }

    try {
        const parsed = JSON.parse(data.setting_value) as PostRevisionEntry[];
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error('Failed to parse post revision history', error);
        return [];
    }
}

async function appendPostRevisionSnapshot(
    client: Awaited<ReturnType<typeof getPostWriteClient>>['client'],
    post: PostRecord
) {
    const revisionEntry: PostRevisionEntry = {
        id: crypto.randomUUID(),
        savedAt: new Date().toISOString(),
        sourcePostId: post.id,
        title: post.title,
        slug: post.slug,
        content: post.content ?? '',
        category_id: post.category_id,
        spotify_uri: post.spotify_uri,
        cover_image: post.cover_image,
        rating: post.rating,
        artist_name: post.artist_name,
        tags: post.tags ?? [],
        is_published: post.is_published,
    };

    const history = await getPostRevisionHistoryInternal(post.id);
    const nextHistory = [revisionEntry, ...history].slice(0, POST_REVISION_LIMIT);

    const { error } = await client
        .from('site_settings')
        .upsert(
            {
                setting_key: getPostRevisionSettingKey(post.id),
                setting_value: JSON.stringify(nextHistory),
                updated_at: revisionEntry.savedAt,
            },
            { onConflict: 'setting_key' }
        );

    if (error) {
        console.error('Failed to save post revision history', error);
    }
}

function buildPersistedPostPayload(
    formData: PostInput,
    options?: {
        slug?: string;
        authorId?: string | null;
        existingPost?: PostRecord | null;
    }
): PersistedPostPayload {
    const existingPost = options?.existingPost ?? null;
    const nextSlug = options?.slug || existingPost?.slug || formData.slug;
    const nextPublishedAt = formData.is_published
        ? existingPost?.published_at || new Date().toISOString()
        : existingPost?.published_at || null;

    return {
        ...formData,
        slug: nextSlug,
        author_id: options?.authorId ?? existingPost?.author_id ?? null,
        published_at: nextPublishedAt,
    };
}

export async function getPosts(): Promise<PostRecord[]> {
    const supabase = await createClient();
    const publishedQuery = await supabase
        .from('posts')
        .select('*, categories(name)')
        .order('published_at', { ascending: false })
        .order('created_at', { ascending: false });

    if (!publishedQuery.error) {
        return (publishedQuery.data ?? []) as PostRecord[];
    }

    if (!isMissingColumnError(publishedQuery.error, 'published_at')) {
        throw publishedQuery.error;
    }

    const createdQuery = await supabase
        .from('posts')
        .select('*, categories(name)')
        .order('created_at', { ascending: false });

    if (createdQuery.error) throw createdQuery.error;
    return (createdQuery.data ?? []) as PostRecord[];
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

export async function getPostRevisionHistory(postId: string): Promise<PostRevisionEntry[]> {
    return getPostRevisionHistoryInternal(postId);
}

export async function createPost(formData: PostInput): Promise<PostRecord> {
    const { client, userId } = await getPostWriteClient();
    const slug = await buildUniquePostSlug(client, formData.title, formData.slug);
    const payload = buildPersistedPostPayload(formData, {
        slug,
        authorId: userId,
    });

    const insertWithPublishedAt = await client
        .from('posts')
        .insert([payload])
        .select()
        .single();

    if (!insertWithPublishedAt.error) {
        await revalidatePostSurfaces(insertWithPublishedAt.data as PostRecord);
        return insertWithPublishedAt.data as PostRecord;
    }

    if (!isMissingColumnError(insertWithPublishedAt.error, 'published_at')) {
        throw insertWithPublishedAt.error;
    }

    const { published_at: _publishedAt, ...fallbackPayload } = payload;
    void _publishedAt;

    const insertWithoutPublishedAt = await client
        .from('posts')
        .insert([fallbackPayload])
        .select()
        .single();

    if (insertWithoutPublishedAt.error) {
        throw insertWithoutPublishedAt.error;
    }

    await revalidatePostSurfaces(insertWithoutPublishedAt.data as PostRecord);
    return insertWithoutPublishedAt.data as PostRecord;
}

export async function updatePost(id: string, formData: PostInput): Promise<PostRecord> {
    const { client } = await getPostWriteClient();
    const existingPost = await getPostById(id);
    await appendPostRevisionSnapshot(client, existingPost);
    const slug = existingPost.slug || await buildUniquePostSlug(client, formData.title, formData.slug, id);
    const payload = buildPersistedPostPayload(formData, {
        slug,
        existingPost,
    });

    const updateWithPublishedAt = await client
        .from('posts')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

    if (!updateWithPublishedAt.error) {
        await revalidatePostSurfaces(updateWithPublishedAt.data as PostRecord, existingPost.slug);
        return updateWithPublishedAt.data as PostRecord;
    }

    if (!isMissingColumnError(updateWithPublishedAt.error, 'published_at')) {
        throw updateWithPublishedAt.error;
    }

    const { published_at: _publishedAt, ...fallbackPayload } = payload;
    void _publishedAt;

    const updateWithoutPublishedAt = await client
        .from('posts')
        .update(fallbackPayload)
        .eq('id', id)
        .select()
        .single();

    if (updateWithoutPublishedAt.error) {
        throw updateWithoutPublishedAt.error;
    }

    await revalidatePostSurfaces(updateWithoutPublishedAt.data as PostRecord, existingPost.slug);
    return updateWithoutPublishedAt.data as PostRecord;
}

export async function deletePost(id: string) {
    const { client } = await getPostWriteClient();
    const existingPost = await getPostById(id).catch(() => null);
    const { error } = await client
        .from('posts')
        .delete()
        .eq('id', id);

    if (error) throw error;
    revalidatePath('/admin');
    revalidatePath('/admin/posts');
    revalidatePath('/');
    if (existingPost?.slug) {
        revalidatePath(`/post/${existingPost.slug}`);
    }
}

export async function duplicatePost(id: string): Promise<PostRecord> {
    const { client, userId } = await getPostWriteClient();
    const sourcePost = await getPostById(id);
    const duplicateTitle = `${sourcePost.title} Copy`;
    const duplicateSlug = await buildUniquePostSlug(client, duplicateTitle);

    const payload: PersistedPostPayload = {
        title: duplicateTitle,
        slug: duplicateSlug,
        content: sourcePost.content,
        category_id: sourcePost.category_id,
        spotify_uri: sourcePost.spotify_uri,
        cover_image: sourcePost.cover_image,
        rating: sourcePost.rating ?? 0,
        artist_name: sourcePost.artist_name,
        tags: sourcePost.tags,
        is_published: false,
        author_id: userId ?? sourcePost.author_id ?? null,
        published_at: null,
    };

    const insertWithPublishedAt = await client
        .from('posts')
        .insert([payload])
        .select('*, categories(name)')
        .single();

    if (!insertWithPublishedAt.error) {
        revalidatePath('/admin');
        revalidatePath('/admin/posts');
        return insertWithPublishedAt.data as PostRecord;
    }

    if (!isMissingColumnError(insertWithPublishedAt.error, 'published_at')) {
        throw insertWithPublishedAt.error;
    }

    const { published_at: _publishedAt, ...fallbackPayload } = payload;
    void _publishedAt;

    const insertWithoutPublishedAt = await client
        .from('posts')
        .insert([fallbackPayload])
        .select('*, categories(name)')
        .single();

    if (insertWithoutPublishedAt.error) {
        throw insertWithoutPublishedAt.error;
    }

    revalidatePath('/admin');
    revalidatePath('/admin/posts');
    return insertWithoutPublishedAt.data as PostRecord;
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
