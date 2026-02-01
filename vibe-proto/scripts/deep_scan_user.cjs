const https = require('https');

const did = "did:plc:ccxl3ictrlvtrrgh5swvvg47";
const targetRkey = "3mdspj6krok26";

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
    console.log(`Deep scanning recent history for ${did}...`);
    
    const url = `https://public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed?actor=${did}&limit=100`;
    const data = await fetchJson(url);

    if (!data.feed) {
      console.log("No feed data found.");
      return;
    }

    console.log(`Checking ${data.feed.length} feed items...`);

    data.feed.forEach(item => {
      const post = item.post;
      const val = post.record;
      const rkey = post.uri.split('/').pop();
      const text = val.text || "";
      
      let isMatch = text.includes(targetRkey);
      
      if (val.embed) {
        const embedStr = JSON.stringify(val.embed);
        if (embedStr.includes(targetRkey)) isMatch = true;
      }

      if (isMatch) {
        console.log(`
[MATCH FOUND] Rkey: ${rkey}`);
        console.log(`Text: ${text.substring(0, 50)}...`);
        console.log(`URI: ${record.uri}`);
        console.log(`Embed Type: ${val.embed ? val.embed.$type : "None"}`);
      }
    });

  } catch (error) {
    console.error("Error:", error.message);
  }
}

main();
