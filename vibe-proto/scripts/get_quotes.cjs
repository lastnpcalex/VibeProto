const https = require('https');

const postUrl = process.argv[2];

if (!postUrl) {
  console.error("Usage: node get_quotes.cjs <bsky-url>");
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
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
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

    console.log(`Fetching quotes for: ${atUri}`);
    
    let cursor = null;
    let allQuotes = [];
    
    do {
        let quotesUrl = `https://public.api.bsky.app/xrpc/app.bsky.feed.getQuotes?uri=${atUri}&limit=100`;
        if (cursor) quotesUrl += `&cursor=${cursor}`;
        
        const quotesData = await fetchJson(quotesUrl);
        
        if (quotesData.posts) {
            allQuotes = allQuotes.concat(quotesData.posts);
        }
        
        cursor = quotesData.cursor;
        if (cursor) console.log("Fetching next page...");
        
    } while (cursor);

    if (allQuotes.length === 0) {
      console.log("No quotes found.");
      return;
    }

    console.log(`\n--- Found ${allQuotes.length} Quotes ---`);
    allQuotes.forEach((post, i) => {
      console.log(`\n[${i+1}] AUTHOR: ${post.author.handle}`);
      console.log(`TEXT:   ${post.record.text}`);
      console.log(`URI:    ${post.uri}`);
      
      // Check for hidden/blocked status
      if (post.author.viewer && post.author.viewer.muted) console.log(" [MUTED AUTHOR]");
    });

  } catch (error) {
    console.error("Error:", error.message);
  }
}

main();
