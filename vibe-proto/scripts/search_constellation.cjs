const https = require('https');

const postUrl = process.argv[2];

if (!postUrl) {
  console.error("Usage: node search_constellation.cjs <bsky-url>");
  process.exit(1);
}

const match = postUrl.match(/profile\/([^\/]+)\/post\/([^\/]+)/);
if (!match) process.exit(1);
const [_, handle, rkey] = match;

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
            resolve(JSON.parse(data));
        } catch (e) {
            // Return raw text if JSON fails
            if (data.trim().length > 0) {
                 reject(new Error(`JSON Parse Failed. Raw response: ${data}`));
            } else {
                 reject(e);
            }
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  try {
    const resolveUrl = `https://public.api.bsky.app/xrpc/com.atproto.identity.resolveHandle?handle=${handle}`;
    const didData = await fetchJson(resolveUrl);
    const did = didData.did;
    const atUri = `at://${did}/app.bsky.feed.post/${rkey}`;

    console.log(`Querying Constellation for backlinks to: ${atUri}`);
    
    // Constellation requires 'collection' to filter the source types (who is doing the linking?)
    // We want to find POSTS that link to this URI via the embed record field.
    const constellationUrl = `https://constellation.microcosm.blue/links?target=${encodeURIComponent(atUri)}&collection=app.bsky.feed.post&path=embed.record.uri`;
    
    console.log(`URL: ${constellationUrl}`);
    
    try {
        const data = await fetchJson(constellationUrl);
        
        if (!data.linking_records || data.linking_records.length === 0) {
             console.log("No backlinks found in Constellation index.");
             return;
        }

        console.log(`\n--- Found ${data.linking_records.length} Backlinks ---`);
        
        data.linking_records.forEach((link, i) => {
            console.log(`\n[${i+1}] Source: ${link.uri || JSON.stringify(link)}`);
        });

    } catch (e) {
        console.error("Constellation API Error:", e.message);
        console.error("The public instance might be down or require different parameters.");
    }

  } catch (error) {
    console.error("Error:", error.message);
  }
}

main();
