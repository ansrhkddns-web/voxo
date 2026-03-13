import { unstable_cache } from 'next/cache';
import { CACHE_TAGS } from '@/lib/cache-tags';
import { createPublicClient } from '@/lib/supabase/public';
import { estimateReadTimeMinutes, stripHtmlTags } from '@/lib/utils';
import type { CategoryRelation, PostRecord, PublicPostSummary, PublicSearchPostSummary, TagRecord } from '@/types/content';

interface SupabaseColumnError {
    code?: string;
    message?: string;
}

interface CategoryPayload {
    name: string;
    slug?: string | null;
}

interface PublicPostSummaryRow {
    id: string;
    title: string;
    slug: string;
    content: string | null;
    category_id: string | null;
    cover_image: string | null;
    rating: number | null;
    artist_name: string | null;
    tags: string[] | null;
    is_published: boolean;
    created_at: string;
    published_at?: string | null;
    view_count?: number | null;
    categories?: CategoryPayload[] | CategoryPayload | null;
}

type PublicPostDetailRow = Omit<PostRecord, 'categories'> & {
    categories?: CategoryPayload[] | CategoryPayload | null;
};

const SUMMARY_SELECT =
    'id,title,slug,content,category_id,cover_image,rating,artist_name,tags,is_published,created_at,published_at,view_count,categories(name,slug)';
const DETAIL_SELECT =
    'id,title,slug,content,category_id,cover_image,spotify_uri,spotify_artist_id,rating,artist_name,tags,is_published,author_id,created_at,updated_at,published_at,view_count,categories(name,slug)';

function withoutPublishedAt(select: string) {
    return select.replace(',published_at', '');
}

function isMissingColumnError(error: unknown, columnName: string) {
    const columnError = error as SupabaseColumnError | null;
    return (
        columnError?.code === '42703' &&
        columnError?.message?.toLowerCase().includes(columnName.toLowerCase())
    );
}

function normalizeCategories(
    categories: CategoryPayload[] | CategoryPayload | null | undefined,
): CategoryRelation | null {
    if (!categories) {
        return null;
    }

    const relation = Array.isArray(categories) ? (categories[0] ?? null) : categories;
    if (!relation?.name) {
        return null;
    }

    return {
        name: relation.name,
        slug: relation.slug ?? undefined,
    };
}

function decodeHtmlAttribute(value: string) {
    return value
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');
}

function extractMetadataExcerpt(content: string | null | undefined) {
    if (!content) {
        return '';
    }

    const metaMatch = content.match(/<div id="voxo-metadata"[^>]*data-excerpt="([^"]*)"/i);
    if (!metaMatch?.[1]) {
        return '';
    }

    return decodeHtmlAttribute(metaMatch[1]).trim();
}

function buildExcerpt(content: string | null | undefined) {
    const excerptFromMetadata = extractMetadataExcerpt(content);
    if (excerptFromMetadata) {
        return excerptFromMetadata;
    }

    const plainText = stripHtmlTags(content);
    if (!plainText) {
        return '';
    }

    if (plainText.length <= 180) {
        return plainText;
    }

    return `${plainText.slice(0, 177).trimEnd()}...`;
}

function buildSearchText(row: PublicPostSummaryRow, excerpt: string) {
    const categoryName = normalizeCategories(row.categories)?.name || '';
    return [
        row.title,
        row.artist_name || '',
        categoryName,
        ...(row.tags ?? []),
        stripHtmlTags(row.content),
        excerpt,
    ]
        .join(' ')
        .toLowerCase();
}

function toPublicSearchSummary(row: PublicPostSummaryRow): PublicSearchPostSummary {
    const excerpt = buildExcerpt(row.content);

    return {
        id: row.id,
        title: row.title,
        slug: row.slug,
        category_id: row.category_id,
        cover_image: row.cover_image,
        rating: row.rating,
        artist_name: row.artist_name,
        tags: row.tags ?? [],
        created_at: row.created_at,
        published_at: row.published_at ?? null,
        view_count: row.view_count ?? 0,
        categories: normalizeCategories(row.categories),
        excerpt,
        readTimeMinutes: estimateReadTimeMinutes(row.content),
        searchableText: buildSearchText(row, excerpt),
    };
}

function normalizeDetailRow(row: PublicPostDetailRow): PostRecord {
    return {
        ...row,
        categories: normalizeCategories(row.categories),
    };
}

async function fetchPublishedPostRows(select: string, limit?: number) {
    const supabase = createPublicClient();

    let publishedAtQuery = supabase
        .from('posts')
        .select(select)
        .eq('is_published', true)
        .order('published_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false });

    if (typeof limit === 'number') {
        publishedAtQuery = publishedAtQuery.limit(limit);
    }

    const publishedResult = await publishedAtQuery;
    if (!publishedResult.error) {
        return publishedResult.data ?? [];
    }

    if (!isMissingColumnError(publishedResult.error, 'published_at')) {
        throw publishedResult.error;
    }

    let createdAtQuery = supabase
        .from('posts')
        .select(withoutPublishedAt(select))
        .eq('is_published', true)
        .order('created_at', { ascending: false });

    if (typeof limit === 'number') {
        createdAtQuery = createdAtQuery.limit(limit);
    }

    const createdResult = await createdAtQuery;
    if (createdResult.error) {
        throw createdResult.error;
    }

    return createdResult.data ?? [];
}

const getCachedPublishedSearchPosts = unstable_cache(
    async () => {
        const rows = (await fetchPublishedPostRows(SUMMARY_SELECT)) as unknown as PublicPostSummaryRow[];
        return rows.map(toPublicSearchSummary);
    },
    ['public-published-search-posts'],
    { revalidate: 300, tags: [CACHE_TAGS.posts] },
);

const getCachedPublishedPostBySlug = unstable_cache(
    async (slug: string) => {
        const supabase = createPublicClient();
        const publishedQuery = await supabase
            .from('posts')
            .select(DETAIL_SELECT)
            .ilike('slug', slug)
            .eq('is_published', true)
            .maybeSingle();

        if (!publishedQuery.error) {
            return publishedQuery.data ? normalizeDetailRow(publishedQuery.data as unknown as PublicPostDetailRow) : null;
        }

        if (!isMissingColumnError(publishedQuery.error, 'published_at')) {
            console.error('Error fetching public post by slug:', publishedQuery.error);
            return null;
        }

        const fallbackQuery = await supabase
            .from('posts')
            .select(withoutPublishedAt(DETAIL_SELECT))
            .ilike('slug', slug)
            .eq('is_published', true)
            .maybeSingle();

        if (fallbackQuery.error) {
            console.error('Error fetching public post by slug without published_at:', fallbackQuery.error);
            return null;
        }

        return fallbackQuery.data ? normalizeDetailRow(fallbackQuery.data as unknown as PublicPostDetailRow) : null;
    },
    ['public-post-by-slug'],
    { revalidate: 300, tags: [CACHE_TAGS.posts] },
);

const getCachedMenuTags = unstable_cache(
    async () => {
        const supabase = createPublicClient();
        const { data, error } = await supabase
            .from('tags')
            .select('*')
            .eq('show_in_menu', true)
            .order('menu_order', { ascending: true })
            .order('name');

        if (error) {
            throw error;
        }

        return (data ?? []) as TagRecord[];
    },
    ['public-menu-tags'],
    { revalidate: 300, tags: [CACHE_TAGS.tags] },
);

export function normalizeCategorySlug(category: Pick<CategoryRelation, 'name' | 'slug'> | null | undefined) {
    const source = category?.slug || category?.name || '';
    return source.toLowerCase().replace(/'/g, '').replace(/\s+/g, '-');
}

export async function getPublicPublishedPostSummaries(): Promise<PublicPostSummary[]> {
    const posts = await getCachedPublishedSearchPosts();
    return posts.map(({ searchableText: _searchableText, ...summary }) => {
        void _searchableText;
        return summary;
    });
}

export async function getPublicSearchIndexPosts(): Promise<PublicSearchPostSummary[]> {
    return getCachedPublishedSearchPosts();
}

export async function getPublicPostsByCategory(categorySlug: string): Promise<PublicPostSummary[]> {
    const posts = await getPublicPublishedPostSummaries();
    return posts.filter((post) => normalizeCategorySlug(post.categories) === categorySlug);
}

export async function getPublicPostBySlug(slug: string) {
    return getCachedPublishedPostBySlug(slug);
}

export async function getPublicPostCompanions(slug: string, limit = 3) {
    const posts = await getPublicPublishedPostSummaries();
    const currentIndex = posts.findIndex((post) => post.slug.toLowerCase() === slug.toLowerCase());

    if (currentIndex === -1) {
        return {
            relatedPosts: [] as PublicPostSummary[],
            adjacentPosts: { previous: null as PublicPostSummary | null, next: null as PublicPostSummary | null },
        };
    }

    const currentPost = posts[currentIndex];
    const currentTags = new Set(currentPost.tags ?? []);

    const relatedPosts = posts
        .filter((post) => post.slug !== currentPost.slug)
        .map((post) => {
            const sharedTags = (post.tags ?? []).filter((tag) => currentTags.has(tag)).length;
            const sameCategory =
                post.category_id && currentPost.category_id && post.category_id === currentPost.category_id ? 2 : 0;
            const viewScore = Math.min((post.view_count ?? 0) / 100, 3);

            return {
                post,
                score: sharedTags * 3 + sameCategory + viewScore,
            };
        })
        .sort((left, right) => right.score - left.score)
        .slice(0, limit)
        .map((item) => item.post);

    return {
        relatedPosts,
        adjacentPosts: {
            previous: posts[currentIndex + 1] ?? null,
            next: posts[currentIndex - 1] ?? null,
        },
    };
}

export async function getPublicMenuTags() {
    return getCachedMenuTags();
}
