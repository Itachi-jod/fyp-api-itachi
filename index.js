// index.js
const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio"); // For scraping
const app = express();
const PORT = process.env.PORT || 3000;

// Helper function to scrape TikTok search
async function searchTikTok(keyword) {
  const url = `https://www.tiktok.com/search?q=${encodeURIComponent(keyword)}`;
  const { data } = await axios.get(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
    }
  });

  // Extract JSON from HTML
  const jsonDataMatch = data.match(/<script id="SIGI_STATE" type="application\/json">(.+?)<\/script>/);
  if (!jsonDataMatch) return [];
  
  const jsonData = JSON.parse(jsonDataMatch[1]);
  const videos = Object.values(jsonData.ItemModule || {});
  return videos.map(v => v.video?.playAddr).filter(Boolean);
}

app.get("/api/fyp", async (req, res) => {
  const keyword = req.query.q; // <- Proper query parameter
  if (!keyword) return res.status(400).json({ success: false, message: "Please provide a keyword as ?q=..." });

  try {
    const videoUrls = await searchTikTok(keyword);
    if (!videoUrls.length) return res.status(404).json({ success: false, message: "No videos found" });

    // Pick a random video
    const randomVideoUrl = videoUrls[Math.floor(Math.random() * videoUrls.length)];

    // Stream video via your downloader API
    const streamRes = await axios.get(`https://tiktok-downloader-ita.vercel.app/api/download?url=${encodeURIComponent(randomVideoUrl)}`, { responseType: "stream" });
    
    res.setHeader("Content-Type", "video/mp4");
    streamRes.data.pipe(res);

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch or stream video", error: err.message });
  }
});

app.listen(PORT, () => console.log(`🚀 TikTok FYP API running on port ${PORT}`));
