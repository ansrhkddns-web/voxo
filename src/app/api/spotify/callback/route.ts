import { NextRequest, NextResponse } from 'next/server';
import {
    SPOTIFY_PENDING_TRACK_COOKIE,
    SPOTIFY_RETURN_COOKIE,
    SPOTIFY_STATE_COOKIE,
    checkTrackSavedInSpotifyLibrary,
    clearSpotifyOAuthCookies,
    exchangeSpotifyCode,
    getSafeReturnUrl,
    getSpotifyRedirectUri,
    parseTrackId,
    saveTrackToSpotifyLibrary,
    setSpotifyAuthCookies,
} from '@/lib/spotify-user-auth';

export async function GET(request: NextRequest) {
    const code = request.nextUrl.searchParams.get('code');
    const state = request.nextUrl.searchParams.get('state');
    const expectedState = request.cookies.get(SPOTIFY_STATE_COOKIE)?.value;
    const returnTo = request.cookies.get(SPOTIFY_RETURN_COOKIE)?.value;
    const pendingTrackUri = request.cookies.get(SPOTIFY_PENDING_TRACK_COOKIE)?.value;
    const redirectUrl = getSafeReturnUrl(request, returnTo);

    if (!code || !state || !expectedState || state !== expectedState) {
        redirectUrl.searchParams.set('spotifyAuth', 'error');
        const response = NextResponse.redirect(redirectUrl);
        clearSpotifyOAuthCookies(response);
        return response;
    }

    try {
        const tokenResponse = await exchangeSpotifyCode(code, getSpotifyRedirectUri(request));
        let saved = false;

        if (pendingTrackUri) {
            const trackId = parseTrackId(pendingTrackUri);
            if (trackId) {
                await saveTrackToSpotifyLibrary(tokenResponse.access_token, trackId);
                saved = await checkTrackSavedInSpotifyLibrary(tokenResponse.access_token, trackId);
            }
        }

        redirectUrl.searchParams.set('spotifyAuth', 'connected');
        if (saved) {
            redirectUrl.searchParams.set('spotifySaved', '1');
        }

        const response = NextResponse.redirect(redirectUrl);
        setSpotifyAuthCookies(
            response,
            {
                accessToken: tokenResponse.access_token,
                refreshToken: tokenResponse.refresh_token,
                expiresIn: tokenResponse.expires_in,
            },
            request,
        );
        clearSpotifyOAuthCookies(response);
        return response;
    } catch (error) {
        console.error('Spotify callback failed', error);
        redirectUrl.searchParams.set('spotifyAuth', 'error');
        const response = NextResponse.redirect(redirectUrl);
        clearSpotifyOAuthCookies(response);
        return response;
    }
}
