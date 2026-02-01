const https = require('https');

const handle = process.argv[2];

if (!handle) {
  console.error("Usage: node inspect_handle.cjs <handle>");
  process.exit(1);
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  try {
    console.log(`Resolving handle: ${handle}...`);
    
    // 1. Resolve Handle
    const resolveUrl = `https://public.api.bsky.app/xrpc/com.atproto.identity.resolveHandle?handle=${handle}`;
    const didData = await fetchJson(resolveUrl);
    
    if (!didData.did) {
      console.error("Could not resolve DID");
      process.exit(1);
    }
    
    const did = didData.did;
    console.log(`DID: ${did}`);

    // 2. Get Profile
    const profileUrl = `https://public.api.bsky.app/xrpc/com.atproto.repo.getRecord?repo=${did}&collection=app.bsky.actor.profile&rkey=self`;
    const profileData = await fetchJson(profileUrl);

    console.log("\n--- Profile Data ---");
    console.log(JSON.stringify(profileData, null, 2));

  } catch (error) {
    console.error("Error:", error.message);
  }
}

main();
