import { NextRequest, NextResponse } from 'next/server';

const SPOTIFY_AUTH_BASE = 'https://accounts.spotify.com';
const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';
const SPOTIFY_SCOPE = 'user-library-modify user-library-read';

export const SPOTIFY_ACCESS_COOKIE = 'voxo_spotify_access_token';
export const SPOTIFY_REFRESH_COOKIE = 'voxo_spotify_refresh_token';
export const SPOTIFY_EXPIRES_COOKIE = 'voxo_spotify_expires_at';
export const SPOTIFY_STATE_COOKIE = 'voxo_spotify_oauth_state';
export const SPOTIFY_RETURN_COOKIE = 'voxo_spotify_return_to';
export const SPOTIFY_PENDING_TRACK_COOKIE = 'voxo_spotify_pending_track_uri';

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;
const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : process.env.VERCEL_URL
            ? `https://${process.env.VERCEL_URL}`
            : undefined);

function normalizeOrigin(value: string) {
    const candidate = value.startsWith('http://') || value.startsWith('https://')
        ? value
        : `https://${value}`;

    return candidate.replace(/\/+$/, '');
}

interface SpotifyTokenResponse {
    access_token: string;
    token_type: string;
    scope?: string;
    expires_in: number;
    refresh_token?: string;
}

export function parseTrackId(uriOrUrl: string) {
    if (!uriOrUrl) {
        return null;
    }

    if (uriOrUrl.startsWith('spotify:track:')) {
        return uriOrUrl.split(':')[2] || null;
    }

    if (uriOrUrl.includes('open.spotify.com/track/')) {
        try {
            const url = new URL(uriOrUrl);
            const match = url.pathname.match(/\/track\/([^/?]+)/);
            return match?.[1] || null;
        } catch {
            return null;
        }
    }

    return null;
}

export function getSpotifyRedirectUri(request: NextRequest) {
    if (REDIRECT_URI) {
        return REDIRECT_URI;
    }

    if (SITE_URL) {
        return new URL('/api/spotify/callback', normalizeOrigin(SITE_URL)).toString();
    }

    return new URL('/api/spotify/callback', request.url).toString();
}

export function buildSpotifyAuthorizeUrl(
    request: NextRequest,
    returnTo: string,
    trackUri?: string,
) {
    const loginUrl = new URL('/api/spotify/login', request.url);
    loginUrl.searchParams.set('returnTo', returnTo);

    if (trackUri) {
        loginUrl.searchParams.set('trackUri', trackUri);
    }

    return loginUrl.toString();
}

export function setSpotifyAuthCookies(
    response: NextResponse,
    tokens: { accessToken: string; refreshToken?: string; expiresIn: number },
    request: NextRequest,
) {
    const isSecure = request.nextUrl.protocol === 'https:' || process.env.NODE_ENV === 'production';
    const expiresAt = Date.now() + tokens.expiresIn * 1000;

    response.cookies.set(SPOTIFY_ACCESS_COOKIE, tokens.accessToken, {
        httpOnly: true,
        sameSite: 'lax',
        secure: isSecure,
        path: '/',
        maxAge: tokens.expiresIn,
    });

    if (tokens.refreshToken) {
        response.cookies.set(SPOTIFY_REFRESH_COOKIE, tokens.refreshToken, {
            httpOnly: true,
            sameSite: 'lax',
            secure: isSecure,
            path: '/',
            maxAge: 60 * 60 * 24 * 30,
        });
    }

    response.cookies.set(SPOTIFY_EXPIRES_COOKIE, String(expiresAt), {
        httpOnly: true,
        sameSite: 'lax',
        secure: isSecure,
        path: '/',
        maxAge: tokens.expiresIn,
    });
}

export function clearSpotifyOAuthCookies(response: NextResponse) {
    response.cookies.delete(SPOTIFY_STATE_COOKIE);
    response.cookies.delete(SPOTIFY_RETURN_COOKIE);
    response.cookies.delete(SPOTIFY_PENDING_TRACK_COOKIE);
}

export function clearSpotifySessionCookies(response: NextResponse) {
    response.cookies.delete(SPOTIFY_ACCESS_COOKIE);
    response.cookies.delete(SPOTIFY_REFRESH_COOKIE);
    response.cookies.delete(SPOTIFY_EXPIRES_COOKIE);
    clearSpotifyOAuthCookies(response);
}

export function getSafeReturnUrl(request: NextRequest, value?: string | null) {
    if (!value) {
        return new URL('/', request.url);
    }

    try {
        const candidate = value.startsWith('/')
            ? new URL(value, request.url)
            : new URL(value);

        if (candidate.origin !== request.nextUrl.origin) {
            return new URL('/', request.url);
        }

        return candidate;
    } catch {
        return new URL('/', request.url);
    }
}

export async function exchangeSpotifyCode(code: string, redirectUri: string) {
    if (!CLIENT_ID || !CLIENT_SECRET) {
        throw new Error('Spotify client credentials are missing.');
    }

    const authString = Buffer.from(`${CLIENT_ID.trim()}:${CLIENT_SECRET.trim()}`).toString('base64');
    const response = await fetch(`${SPOTIFY_AUTH_BASE}/api/token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${authString}`,
        },
        body: new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: redirectUri,
        }),
        cache: 'no-store',
    });

    if (!response.ok) {
        throw new Error(await response.text());
    }

    return (await response.json()) as SpotifyTokenResponse;
}

export async function refreshSpotifyAccessToken(refreshToken: string) {
    if (!CLIENT_ID || !CLIENT_SECRET) {
        throw new Error('Spotify client credentials are missing.');
    }

    const authString = Buffer.from(`${CLIENT_ID.trim()}:${CLIENT_SECRET.trim()}`).toString('base64');
    const response = await fetch(`${SPOTIFY_AUTH_BASE}/api/token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${authString}`,
        },
        body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
        }),
        cache: 'no-store',
    });

    if (!response.ok) {
        throw new Error(await response.text());
    }

    return (await response.json()) as SpotifyTokenResponse;
}

export async function saveTrackToSpotifyLibrary(accessToken: string, trackId: string) {
    const response = await fetch(`${SPOTIFY_API_BASE}/me/tracks?ids=${encodeURIComponent(trackId)}`, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        cache: 'no-store',
    });

    if (!response.ok) {
        throw new Error(await response.text());
    }
}

export async function checkTrackSavedInSpotifyLibrary(accessToken: string, trackId: string) {
    const response = await fetch(`${SPOTIFY_API_BASE}/me/tracks/contains?ids=${encodeURIComponent(trackId)}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        cache: 'no-store',
    });

    if (!response.ok) {
        throw new Error(await response.text());
    }

    const data = (await response.json()) as boolean[];
    return Boolean(data?.[0]);
}

export function createSpotifyAuthorizationRedirect(
    request: NextRequest,
    returnTo: string,
    trackUri?: string,
) {
    if (!CLIENT_ID) {
        throw new Error('Spotify client id is missing.');
    }

    const redirectUri = getSpotifyRedirectUri(request);
    const authUrl = new URL(`${SPOTIFY_AUTH_BASE}/authorize`);
    const state = crypto.randomUUID();

    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('client_id', CLIENT_ID.trim());
    authUrl.searchParams.set('scope', SPOTIFY_SCOPE);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('show_dialog', 'true');

    const response = NextResponse.redirect(authUrl);
    const isSecure = request.nextUrl.protocol === 'https:' || process.env.NODE_ENV === 'production';

    response.cookies.set(SPOTIFY_STATE_COOKIE, state, {
        httpOnly: true,
        sameSite: 'lax',
        secure: isSecure,
        path: '/',
        maxAge: 60 * 10,
    });
    response.cookies.set(SPOTIFY_RETURN_COOKIE, returnTo, {
        httpOnly: true,
        sameSite: 'lax',
        secure: isSecure,
        path: '/',
        maxAge: 60 * 10,
    });

    if (trackUri) {
        response.cookies.set(SPOTIFY_PENDING_TRACK_COOKIE, trackUri, {
            httpOnly: true,
            sameSite: 'lax',
            secure: isSecure,
            path: '/',
            maxAge: 60 * 10,
        });
    }

    return response;
}
