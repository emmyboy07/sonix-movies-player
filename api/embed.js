const axios = require("axios");
const cheerio = require("cheerio");

module.exports = async (req, res) => {
  const { url } = req.query;

  // Custom endpoint info and warning for root or invalid requests
  if (!url || (!url.startsWith("https://player.videasy.net/movie/") && !url.startsWith("https://player.videasy.net/tv/"))) {
    return res.status(400).send(
      `<h2>sonix-movies player api</h2>
      <p><strong>Warning:</strong> Do not tamper with or attempt to scrape this API. Unauthorized use is prohibited and may result in access being blocked.</p>`
    );
  }

  // Helper to fetch and cleanly embed any supported player URL
  async function fetchAndEmbed(targetUrl, fallbackTitle = "AutoEmbed Fallback") {
    try {
      const response = await axios.get(targetUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Referer": "https://vidsrc.vip/",
          "Accept-Language": "en-US,en;q=0.9",
        },
      });
      const $ = cheerio.load(response.data);
      const iframe = $("iframe").first();
      if (!iframe.length) return null;
      iframe.attr("sandbox", "allow-same-origin allow-scripts");
      const pageTitle = $("title").text().trim() || fallbackTitle;
      return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>${pageTitle}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body, html { 
              margin: 0; 
              padding: 0; 
              height: 100%; 
              background: #000; 
              overflow: hidden; /* Hide scrollbars */
            }
            iframe { 
              width: 100%; 
              height: 100%; 
              border: none; 
              overflow: hidden; /* Hide scrollbars in iframe */
              scrollbar-width: none; /* Firefox */
            }
            iframe::-webkit-scrollbar { 
              display: none; /* Chrome, Safari */
            }
          </style>
        </head>
        <body>
          ${$.html(iframe)}
        </body>
        </html>
      `;
    } catch (e) {
      return null;
    }
  }

  try {
    // Try Videasy first
    const movieMatch = url.match(/\/movie\/(\d+)/);
    const tvMatch = url.match(/\/tv\/(\d+)(?:\/(\d+))?(?:\/(\d+))?/);
    let videasyUrl = null;
    const accentColor = "ff0000"; // Red color

    if (movieMatch) {
      // https://player.videasy.net/movie/movie_id?color=ff0000
      videasyUrl = `https://player.videasy.net/movie/${movieMatch[1]}?color=${accentColor}`;
    } else if (tvMatch) {
      // https://player.videasy.net/tv/show_id/season/episode?color=ff0000
      const showId = tvMatch[1];
      const season = tvMatch[2] || 1;
      const episode = tvMatch[3] || 1;
      videasyUrl = `https://player.videasy.net/tv/${showId}/${season}/${episode}?color=${accentColor}`;
    }

    if (videasyUrl) {
      // Directly embed the Videasy iframe
      const pageTitle = "Videasy Player";
      const iframeHtml = `<iframe src="${videasyUrl}" sandbox="allow-same-origin allow-scripts" style="width:100%;height:100%;border:none;overflow:hidden;" allowfullscreen></iframe>`;
      const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>${pageTitle}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body, html { margin: 0; padding: 0; height: 100%; background: #000; overflow: hidden; }
            iframe { width: 100%; height: 100%; border: none; overflow: hidden; scrollbar-width: none; }
            iframe::-webkit-scrollbar { display: none; }
          </style>
        </head>
        <body>
          ${iframeHtml}
        </body>
        </html>
      `;
      res.setHeader("Content-Type", "text/html");
      return res.send(html);
    }

    // If not found, fallback to old logic (optional, or just 404)
    return res.status(404).send("The iframe was not found and no fallback could be determined.");
  } catch (error) {
    console.error("Proxy error:", error.message);
    return res.status(500).send("Error processing URL and no fallback could be determined.");
  }
};
