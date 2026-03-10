export type SpotifyEntityType = 'artist' | 'album' | 'track' | 'playlist';

export interface SpotifyTrackSummary {
  id: string;
  title: string;
  duration: string;
}

export interface SpotifyArtistStats {
  name: string;
  followers: number;
  monthly_listeners: number;
  genres: string[];
  topTracks: SpotifyTrackSummary[];
  image: string;
  external_url: string;
  is_rescue?: boolean;
  is_scraped?: boolean;
}

export interface SpotifyErrorResult {
  error: string;
}

export type SpotifyStatsResult = SpotifyArtistStats | SpotifyErrorResult | null;
