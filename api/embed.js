const axios = require("axios");
const cheerio = require("cheerio");

module.exports = async (req, res) => {
  const { url } = req.query;

  if (!url || !url.startsWith("https://vidsrc.xyz/embed/")) {
    return res.status(400).send(
      `<h2>sonix-movies player api</h2>
      <p><strong>Warning:</strong> Do not tamper with or attempt to scrape this API. Unauthorized use is prohibited and may result in access being blocked.</p>`
    );
  }

  async function fetchAndEmbed(targetUrl, fallbackTitle = "AutoEmbed Fallback") {
    try {
      const response = await axios.get(targetUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
          "Referer": "https://vidsrc.vip/",
          "Connection": "keep-alive",
          "Upgrade-Insecure-Requests": "1",
          "Sec-Fetch-Dest": "document",
          "Sec-Fetch-Mode": "navigate",
          "Sec-Fetch-Site": "cross-site",
          "Sec-Fetch-User": "?1",
          // Add cookies if you have any from your browser session
        },
        maxRedirects: 5,
        validateStatus: status => status < 500,
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
            body, html { margin: 0; padding: 0; height: 100%; background: #000; overflow: hidden; }
            iframe { width: 100%; height: 100%; border: none; overflow: hidden; scrollbar-width: none; }
            iframe::-webkit-scrollbar { display: none; }
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
    const mainHtml = await fetchAndEmbed(url, "VidSrc-Embeds-NoAds made by ScriptSRC.com");
    if (mainHtml) {
      res.setHeader("Content-Type", "text/html");
      return res.send(mainHtml);
    }
    const movieMatch = url.match(/\/embed\/movie\/(\d+)/);
    const tvMatch = url.match(/\/embed\/tv\/(\d+)\/(\d+)-(\d+)/);
    let autoEmbedUrl = null;
    if (movieMatch) {
      autoEmbedUrl = `https://vidsrc.xyz/embed/movie/${movieMatch[1]}`;
    } else if (tvMatch) {
      const tmdbId = tvMatch[1];
      const season = tvMatch[2];
      const episode = tvMatch[3];
      autoEmbedUrl = `https://vidsrc.xyz/embed/tv/${tmdbId}/${season}-${episode}`;
    }
    if (autoEmbedUrl) {
      const fallbackHtml = await fetchAndEmbed(autoEmbedUrl, "AutoEmbed Fallback");
      if (fallbackHtml) {
        res.setHeader("Content-Type", "text/html");
        return res.send(fallbackHtml);
      }
    }
    return res.status(404).send("The iframe was not found and no fallback could be determined.");
  } catch (error) {
    console.error("Proxy error:", error.message);
    return res.status(500).send("Error processing URL and no fallback could be determined.");
  }
};
