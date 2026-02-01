const https = require('https');

const postUrl = process.argv[2];

if (!postUrl) {
  console.error("Usage: node extract_thread_links.cjs <bsky-url>");
  process.exit(1);
}

// Helper: Parse URL to get Handle and Rkey
const match = postUrl.match(/profile\/([^\/]+)\/post\/([^\/]+)/);
if (!match) {
  console.error("Invalid Bluesky URL format. Expected .../profile/<handle>/post/<rkey>");
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
    const atUri = `at://${did}/app.bsky.feed.post/${rkey}`;
    console.log(`Fetching thread for: ${atUri}`);

    const threadUrl = `https://public.api.bsky.app/xrpc/app.bsky.feed.getPostThread?uri=${atUri}&depth=10`;
    const threadData = await fetchJson(threadUrl);

    if (!threadData.thread) {
      throw new Error("No thread data found.");
    }

    const links = new Set();

    function processPost(node) {
      if (!node) return;
      
      const post = node.post;
      if (post && post.record && post.record.facets) {
        post.record.facets.forEach(facet => {
          if (facet.features) {
            facet.features.forEach(feature => {
              if (feature.$type === 'app.bsky.richtext.facet#link') {
                links.add(feature.uri);
              }
            });
          }
        });
      }

      // Check replies
      if (node.replies) {
        node.replies.forEach(reply => processPost(reply));
      }
    }

    processPost(threadData.thread);

    console.log("\n--- Links Found ---");
    links.forEach(link => console.log(link));

  } catch (error) {
    console.error("Error:", error.message);
  }
}

main();
