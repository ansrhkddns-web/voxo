const https = require('https');

function fetchHtml(url) {
    return new Promise((resolve, reject) => {
        https.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
                'Accept-Language': 'en-US,en;q=0.9'
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

async function run() {
    const fs = require('fs');
    // An artist URL (e.g., The Weeknd)
    const url = 'https://open.spotify.com/artist/1Xyo4u8uXC1ZmMpzINkxVK'; // Real artist
    const html = await fetchHtml(url);
    fs.writeFileSync('test-artist.html', html);
    console.log("Dumped Artist HTML. Length:", html.length);
}

run();
