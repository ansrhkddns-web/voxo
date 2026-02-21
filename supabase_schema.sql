-- VOXO Database Schema

-- 1. Categories Table
create table categories (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  slug text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Posts Table (Extended)
create table posts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text not null unique,
  content text,
  category_id uuid references categories(id) on delete set null,
  cover_image text,
  spotify_uri text,
  rating decimal(3,1) check (rating >= 0 and rating <= 10.0), -- Review Rating (0.0 to 10.0)
  artist_name text,                                       -- Track/Artist Name
  tags text[],                                            -- Moods/Genres Tags
  is_published boolean default false,
  author_id uuid references auth.users(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Subscribers Table (Mailing List)
create table subscribers (
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  status text default 'active' check (status in ('active', 'unsubscribed')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Row Level Security (RLS)

-- Categories: Anyone can read, only Admins can write
alter table categories enable row level security;
create policy "Categories are viewable by everyone" on categories for select using (true);
create policy "Categories are manageable by admins" on categories for all 
  using (auth.role() = 'authenticated');

-- Posts: Only published posts are viewable by everyone
alter table posts enable row level security;
create policy "Published posts are viewable by everyone" on posts for select using (is_published = true);
create policy "Admins can view all posts" on posts for select 
  using (auth.role() = 'authenticated');
create policy "Admins can manage all posts" on posts for all 
  using (auth.role() = 'authenticated');

-- Subscribers: Only Admins can view/manage
alter table subscribers enable row level security;
create policy "New subscriptions allowed for everyone" on subscribers for insert with check (true);
create policy "Only admins can view subscribers" on subscribers for select 
  using (auth.role() = 'authenticated');
create policy "Only admins can manage subscribers" on subscribers for all 
  using (auth.role() = 'authenticated');


-- 5. Storage Buckets (Images)
-- Run these in Supabase Dashboard:
-- insert into storage.buckets (id, name, public) values ('images', 'images', true);
