export interface CategoryRelation {
  name: string;
  slug?: string;
}

export interface CategoryRecord {
  id: string;
  name: string;
  slug: string;
}

export interface TagRecord {
  id: string;
  name: string;
  slug: string;
  show_in_menu: boolean;
  menu_order: number;
}

export interface PostRecord {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  category_id: string | null;
  cover_image: string | null;
  spotify_uri: string | null;
  spotify_artist_id?: string | null;
  rating: number | null;
  artist_name: string | null;
  tags: string[] | null;
  is_published: boolean;
  author_id?: string | null;
  created_at: string;
  updated_at?: string;
  published_at?: string | null;
  view_count?: number | null;
  categories?: CategoryRelation | null;
}

export interface AdminPostSummary {
  id: string;
  title: string;
  slug: string;
  category_id: string | null;
  cover_image: string | null;
  rating: number | null;
  artist_name: string | null;
  tags: string[];
  is_published: boolean;
  author_id?: string | null;
  created_at: string;
  updated_at?: string;
  published_at?: string | null;
  view_count?: number | null;
  categories?: CategoryRelation | null;
}

export interface PostInput {
  title: string;
  content: string;
  category_id: string;
  spotify_uri: string;
  cover_image: string;
  rating: number;
  artist_name: string;
  tags: string[];
  is_published: boolean;
  slug: string;
}

export interface SearchPostResult {
  title: string;
  slug: string;
  categories: CategoryRelation | null;
}

export interface PublicPostSummary {
  id: string;
  title: string;
  slug: string;
  category_id: string | null;
  cover_image: string | null;
  rating: number | null;
  artist_name: string | null;
  tags: string[];
  created_at: string;
  published_at?: string | null;
  view_count?: number | null;
  categories?: CategoryRelation | null;
  excerpt: string;
  readTimeMinutes: number;
}

export interface PublicSearchPostSummary extends PublicPostSummary {
  searchableText: string;
}
