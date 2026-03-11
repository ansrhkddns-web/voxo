import { NextRequest, NextResponse } from 'next/server';
import {
    SPOTIFY_ACCESS_COOKIE,
    SPOTIFY_EXPIRES_COOKIE,
    SPOTIFY_REFRESH_COOKIE,
    buildSpotifyAuthorizeUrl,
    checkTrackSavedInSpotifyLibrary,
    parseTrackId,
    refreshSpotifyAccessToken,
    saveTrackToSpotifyLibrary,
    setSpotifyAuthCookies,
} from '@/lib/spotify-user-auth';

async function resolveAccessToken(request: NextRequest, response: NextResponse) {
    const accessToken = request.cookies.get(SPOTIFY_ACCESS_COOKIE)?.value;
    const refreshToken = request.cookies.get(SPOTIFY_REFRESH_COOKIE)?.value;
    const expiresAt = Number(request.cookies.get(SPOTIFY_EXPIRES_COOKIE)?.value || '0');

    if (accessToken && expiresAt > Date.now() + 5000) {
        return accessToken;
    }

    if (!refreshToken) {
        return null;
    }

    const refreshed = await refreshSpotifyAccessToken(refreshToken);
    setSpotifyAuthCookies(
        response,
        {
            accessToken: refreshed.access_token,
            refreshToken: refreshed.refresh_token || refreshToken,
            expiresIn: refreshed.expires_in,
        },
        request,
    );

    return refreshed.access_token;
}

export async function POST(request: NextRequest) {
    const body = (await request.json().catch(() => ({}))) as { uri?: string; returnTo?: string };
    const uri = body.uri || '';
    const returnTo = body.returnTo || '/';
    const trackId = parseTrackId(uri);

    if (!trackId) {
        return NextResponse.json({ saved: false, error: 'invalid_track' }, { status: 400 });
    }

    const response = NextResponse.json({ saved: false });

    try {
        const accessToken = await resolveAccessToken(request, response);

        if (!accessToken) {
            return NextResponse.json(
                {
                    saved: false,
                    connected: false,
                    authorizeUrl: buildSpotifyAuthorizeUrl(request, returnTo, uri),
                },
                { status: 401 },
            );
        }

        await saveTrackToSpotifyLibrary(accessToken, trackId);
        const saved = await checkTrackSavedInSpotifyLibrary(accessToken, trackId);
        const successResponse = NextResponse.json({ connected: true, saved });
        response.cookies.getAll().forEach((cookie) => {
            successResponse.cookies.set(cookie);
        });
        return successResponse;
    } catch (error) {
        console.error('Spotify save failed', error);
        const failureResponse = NextResponse.json(
            {
                saved: false,
                connected: false,
                authorizeUrl: buildSpotifyAuthorizeUrl(request, returnTo, uri),
            },
            { status: 401 },
        );
        response.cookies.getAll().forEach((cookie) => {
            failureResponse.cookies.set(cookie);
        });
        return failureResponse;
    }
}
