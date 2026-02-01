const https = require('https');

const postUrl = process.argv[2];

if (!postUrl) {
  console.error("Usage: node search_post_references.cjs <bsky-url>");
  process.exit(1);
}

// Extract a search-friendly string (handle and rkey are unique enough)
// e.g., "lastnpcalex.agency/post/3mdspj6krok26"
const match = postUrl.match(/profile\/([^\/]+)\/post\/([^\/]+)/);
if (!match) {
    console.error("Invalid URL");
    process.exit(1);
}
const [_, handle, rkey] = match;
const query = `${handle}/post/${rkey}`;

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
    console.log(`Searching for references to: ${query}`);
    
    // Use the public search API
    const searchUrl = `https://public.api.bsky.app/xrpc/app.bsky.feed.searchPosts?q=${encodeURIComponent(query)}`;
    
    // Note: Search often requires auth headers or fails with 403/HTML on public endpoint.
    // We try to fetch, but handle failure gracefully.
    let results;
    try {
        results = await fetchJson(searchUrl);
    } catch (e) {
        console.log("Search API is restricted (requires auth). Cannot perform deep search without credentials.");
        return;
    }

    if (!results.posts || results.posts.length === 0) {
      console.log("No references found via search.");
      return;
    }

    console.log(`\n--- Found ${results.posts.length} References ---
`);
    
    results.posts.forEach((post, i) => {
      console.log(`\n[${i+1}] AUTHOR: ${post.author.handle}`);
      console.log(`URI:    ${post.uri}`);
      console.log(`TEXT:   "${post.record.text}"`);
      
      // Check if it is a formal quote (embed)
      if (post.embed && post.embed.$type.includes('record')) {
         console.log(`TYPE:   Formal Quote (Embed)`);
      } else {
         console.log(`TYPE:   Text Link / Mention`);
      }
    });

  } catch (error) {
    console.error("Error:", error.message);
  }
}

main();
