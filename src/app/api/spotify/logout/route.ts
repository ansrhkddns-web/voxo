import { NextRequest, NextResponse } from 'next/server';
import { clearSpotifySessionCookies, getSafeReturnUrl } from '@/lib/spotify-user-auth';

export async function POST(request: NextRequest) {
    const body = (await request.json().catch(() => ({}))) as { returnTo?: string };
    const redirectUrl = getSafeReturnUrl(request, body.returnTo || '/');
    redirectUrl.searchParams.set('spotifyAuth', 'disconnected');

    const response = NextResponse.json({
        ok: true,
        redirectTo: redirectUrl.toString(),
    });
    clearSpotifySessionCookies(response);
    return response;
}
