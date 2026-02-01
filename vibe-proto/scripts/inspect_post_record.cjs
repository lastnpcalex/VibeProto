const https = require('https');

const postUrl = process.argv[2];

if (!postUrl) {
  console.error("Usage: node inspect_post_record.cjs <bsky-url>");
  process.exit(1);
}

const match = postUrl.match(/profile\/([^\/]+)\/post\/([^\/]+)/);
if (!match) {
  console.error("Invalid URL format.");
  process.exit(1);
}
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
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  try {
    console.log(`Resolving handle: ${handle}...`);
    const resolveUrl = `https://public.api.bsky.app/xrpc/com.atproto.identity.resolveHandle?handle=${handle}`;
    const didData = await fetchJson(resolveUrl);
    
    if (!didData.did) {
      throw new Error("Could not resolve DID");
    }
    const did = didData.did;
    
    console.log(`DID: ${did}`);
    console.log(`RKey: ${rkey}`);
    
    // Fetch the Post Record
    const recordUrl = `https://public.api.bsky.app/xrpc/com.atproto.repo.getRecord?repo=${did}&collection=app.bsky.feed.post&rkey=${rkey}`;
    console.log(`Fetching Record: ${recordUrl}`);
    
    const recordData = await fetchJson(recordUrl);
    
    if (recordData.error) {
      console.error("Error fetching record:", recordData);
      return;
    }

    console.log("\n--- Post Record Raw Data ---");
    console.log(JSON.stringify(recordData, null, 2));

    // Check for Embeds (Quote Posts)
    const value = recordData.value;
    if (value.embed) {
      console.log("\n--- Embed Detected ---");
      console.log("Embed Type:", value.embed.$type);
      
      if (value.embed.$type === 'app.bsky.embed.record') {
        const quotedUri = value.embed.record.uri;
        console.log("Quoted URI:", quotedUri);
        
        // Parse the quoted URI (at://did/collection/rkey)
        const quoteMatch = quotedUri.match(/at:\/\/([^\/]+)\/([^\/]+)\/([^\/]+)/);
        if (quoteMatch) {
          const [__, qDid, qCol, qRkey] = quoteMatch;
          
          console.log(`\nChecking Quoted Record status...`);
          const checkUrl = `https://public.api.bsky.app/xrpc/com.atproto.repo.getRecord?repo=${qDid}&collection=${qCol}&rkey=${qRkey}`;
          
          try {
            const qData = await fetchJson(checkUrl);
            if (qData.error) {
               console.log("❌ Quoted record ERROR:", qData);
               console.log("This explains the 'ghost' quote (deleted or deactivated).");
            } else {
               console.log("✅ Quoted record exists.");
               console.log("Quoted Content:", JSON.stringify(qData.value.text || qData.value, null, 2));
            }
          } catch (e) {
             console.log("❌ Failed to fetch quoted record (Network error or 404).");
          }
        }
      }
    } else {
      console.log("\nNo embed found in this post.");
    }

  } catch (error) {
    console.error("Fatal Error:", error.message);
  }
}

main();
