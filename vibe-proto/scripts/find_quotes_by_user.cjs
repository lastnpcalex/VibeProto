const https = require('https');

const handle = process.argv[2];
const targetUriSegment = process.argv[3]; // Part of the URI we are looking for (e.g. rkey)

if (!handle || !targetUriSegment) {
  console.error("Usage: node find_quotes_by_user.cjs <handle> <target-uri-segment>");
  process.exit(1);
}

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
    console.log(`Resolving handle: ${handle}...`);
    const resolveUrl = `https://public.api.bsky.app/xrpc/com.atproto.identity.resolveHandle?handle=${handle}`;
    const didData = await fetchJson(resolveUrl);
    const did = didData.did;

    console.log(`Fetching recent posts for ${did}...`);
    const listUrl = `https://public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed?actor=${handle}&limit=20&filter=posts_with_replies`;
    const listData = await fetchJson(listUrl);

    if (!listData.feed) {
      console.log("No feed data found.");
      return;
    }

    console.log(`Searching ${listData.feed.length} posts for quotes containing '${targetUriSegment}'...`);

    const found = [];

    for (const item of listData.feed) {
      const post = item.post;
      const val = post.record;
      let quotedUri = null;

      if (post.embed) {
        if (post.embed.$type === 'app.bsky.embed.record' && post.embed.record) {
          quotedUri = post.embed.record.uri;
        } else if (post.embed.$type === 'app.bsky.embed.recordWithMedia' && post.embed.record) {
           // In the feed view, the inner record might be fully expanded or just a link
           quotedUri = post.embed.record.record ? post.embed.record.record.uri : null;
        }
      }

      if (quotedUri && quotedUri.includes(targetUriSegment)) {
        found.push({
          uri: record.uri,
          text: val.text,
          quoted: quotedUri
        });
      }
    }

    if (found.length === 0) {
      console.log("No matching quotes found in recent posts.");
    } else {
      console.log(`\n--- Found ${found.length} matching quotes ---`);
      found.forEach((f, i) => {
        console.log(`\n[${i+1}] Post URI: ${f.uri}`);
        console.log(`Text: "${f.text}"`);
        console.log(`Quoting: ${f.quoted}`);
      });
    }

  } catch (error) {
    console.error("Error:", error.message);
  }
}

main();
