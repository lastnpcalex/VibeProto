const https = require('https');

const postUrl = process.argv[2];

if (!postUrl) {
  console.error("Usage: node print_thread_structure.cjs <bsky-url>");
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

    const threadUrl = `https://public.api.bsky.app/xrpc/app.bsky.feed.getPostThread?uri=${atUri}&depth=10`;
    const threadData = await fetchJson(threadUrl);

    if (!threadData.thread) throw new Error("No thread data.");

    function printPost(node, depth = 0) {
      if (!node) return;
      
      const indent = "  ".repeat(depth);
      const post = node.post;
      if (!post) return; // Might be a 'notFound' or 'blocked' node

      const author = post.author.handle;
      const text = (post.record.text || "").replace(/\n/g, " ");
      
      console.log(`${indent}------------------------------------------------`);
      console.log(`${indent}AUTHOR: ${author}`);
      console.log(`${indent}TEXT:   ${text.substring(0, 100)}${text.length > 100 ? "..." : ""}`);
      console.log(`${indent}URI:    ${post.uri}`);

      if (post.embed && post.embed.record) {
         // Handle direct record embeds
         const q = post.embed.record;
         const qUri = q.uri || (q.record ? q.record.uri : "Unknown URI");
         const qAuthor = q.author ? q.author.handle : "Unknown";
         console.log(`${indent}[QUOTING]: ${qAuthor} (${qUri})`);
      } else if (post.embed && post.embed.recordWithMedia) {
         // Handle recordWithMedia (like the one we saw earlier)
         const q = post.embed.record.record; // nested record
         const qUri = q.uri || "Unknown URI";
         // The author info might not be fully hydrated in the embed view, but let's try
         const qAuthor = post.embed.record.author ? post.embed.record.author.handle : "Unknown";
         console.log(`${indent}[QUOTING]: ${qAuthor} (${qUri})`);
      }

      if (node.replies) {
        node.replies.forEach(reply => printPost(reply, depth + 1));
      }
    }

    printPost(threadData.thread);

  } catch (error) {
    console.error("Error:", error.message);
  }
}

main();
