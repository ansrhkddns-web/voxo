export type SpotifyEntityType = 'artist' | 'album' | 'track' | 'playlist';

export interface SpotifyTrackSummary {
  id: string;
  title: string;
  duration: string;
}

export interface SpotifyTrackCandidate {
  id: string;
  title: string;
  artistName: string;
  albumTitle: string;
  image: string;
  externalUrl: string;
}

export interface SpotifyArtistStats {
  name: string;
  followers: number;
  monthly_listeners: number;
  genres: string[];
  topTracks: SpotifyTrackSummary[];
  image: string;
  external_url: string;
  album_title?: string;
  matched_track_title?: string;
  matched_entity_type?: SpotifyEntityType;
  match_source?: 'direct-track' | 'direct-album' | 'direct-artist' | 'track-search' | 'album-fallback' | 'artist-search' | 'scrape-fallback';
  is_rescue?: boolean;
  is_scraped?: boolean;
}

export interface SpotifyErrorResult {
  error: string;
}

export type SpotifyStatsResult = SpotifyArtistStats | SpotifyErrorResult | null;
