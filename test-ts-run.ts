import { getArtistStats } from './src/app/actions/spotifyActions';

async function test() {
    console.log("Testing Track (Blinding Lights):");
    const trackRes = await getArtistStats('https://open.spotify.com/track/0VjIjW4GlUZAMYd2vXMi3b');
    console.log(JSON.stringify(trackRes, null, 2));

    console.log("\nTesting Album (GØTTERFUNKEN Album):");
    const albumRes = await getArtistStats('https://open.spotify.com/album/32V59tLdZg0qF1gNqLhH1v'); // Just some id
    console.log(JSON.stringify(albumRes, null, 2));
}

test();
