import { NextRequest } from 'next/server';
import { createSpotifyAuthorizationRedirect } from '@/lib/spotify-user-auth';

export async function GET(request: NextRequest) {
    const returnTo = request.nextUrl.searchParams.get('returnTo') || '/';
    const trackUri = request.nextUrl.searchParams.get('trackUri') || undefined;

    return createSpotifyAuthorizationRedirect(request, returnTo, trackUri);
}
