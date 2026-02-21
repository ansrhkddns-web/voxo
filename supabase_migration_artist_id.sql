-- VOXO Migration: Add artist_spotify_id column
-- Run this in Supabase Dashboard → SQL Editor

ALTER TABLE posts
ADD COLUMN IF NOT EXISTS artist_spotify_id TEXT;

COMMENT ON COLUMN posts.artist_spotify_id IS 'Spotify Artist ID (e.g. 0TnOYISbd1XYRBk9myaseg) — bypasses API restrictions';
