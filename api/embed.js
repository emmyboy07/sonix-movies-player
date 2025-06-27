const axios = require("axios");
const cheerio = require("cheerio");

module.exports = async (req, res) => {
  const { url } = req.query;

  if (!url || !url.startsWith("https://vidsrc.in/embed/")) {
    return res.status(400).send("Invalid or missing URL");
  }

  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    const $ = cheerio.load(response.data);

    const iframe = $("iframe").first();
    const pageTitle = $("title").text().trim() || "VidSrc-Embeds-NoAds made by ScriptSRC.com";

    if (!iframe.length) {
      // Try to extract TMDB ID and type from the URL
      // Movie: https://vidsrc.in/embed/movie/{tmdb_id}
      // TV:    https://vidsrc.in/embed/tv/{tmdb_id}/{season_number}/{episode_number}
      const movieMatch = url.match(/\/embed\/movie\/(\d+)/);
      const tvMatch = url.match(/\/embed\/tv\/(\d+)(?:\/(\d+))?(?:\/(\d+))?/);
      let autoEmbedUrl = null;
      if (movieMatch) {
        autoEmbedUrl = `https://autoembed.pro/embed/movie/${movieMatch[1]}`;
      } else if (tvMatch) {
        const tmdbId = tvMatch[1];
        const season = tvMatch[2] || 1;
        const episode = tvMatch[3] || 1;
        autoEmbedUrl = `https://autoembed.pro/embed/tv/${tmdbId}/${season}/${episode}`;
      }
      if (autoEmbedUrl) {
        res.setHeader("Content-Type", "text/html");
        return res.send(`
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <title>AutoEmbed Fallback</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body, html { margin: 0; padding: 0; height: 100%; background: #000; }
              iframe { width: 100%; height: 100%; border: none; }
            </style>
          </head>
          <body>
            <iframe src="${autoEmbedUrl}" allowfullscreen sandbox="allow-same-origin allow-scripts"></iframe>
          </body>
          </html>
        `);
      } else {
        return res.status(404).send("The iframe was not found and no fallback could be determined.");
      }
    }

    iframe.attr("sandbox", "allow-same-origin allow-scripts");

    res.setHeader("Content-Type", "text/html");
    res.send(`
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
          }
          iframe {
            width: 100%;
            height: 100%;
            border: none;
          }
        </style>
      </head>
      <body>
        ${$.html(iframe)}
      </body>
      </html>
    `);
  } catch (error) {
    console.error("Proxy error:", error.message);
    // Try to extract TMDB ID and type from the URL for fallback
    const { url } = req.query;
    const movieMatch = url && url.match(/\/embed\/movie\/(\d+)/);
    const tvMatch = url && url.match(/\/embed\/tv\/(\d+)(?:\/(\d+))?(?:\/(\d+))?/);
    let autoEmbedUrl = null;
    if (movieMatch) {
      autoEmbedUrl = `https://autoembed.pro/embed/movie/${movieMatch[1]}`;
    } else if (tvMatch) {
      const tmdbId = tvMatch[1];
      const season = tvMatch[2] || 1;
      const episode = tvMatch[3] || 1;
      autoEmbedUrl = `https://autoembed.pro/embed/tv/${tmdbId}/${season}/${episode}`;
    }
    if (autoEmbedUrl) {
      res.setHeader("Content-Type", "text/html");
      return res.send(`
        <!DOCTYPE html>
        <html lang=\"en\">
        <head>
          <meta charset=\"UTF-8\">
          <title>AutoEmbed Fallback</title>
          <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
          <style>
            body, html { margin: 0; padding: 0; height: 100%; background: #000; }
            iframe { width: 100%; height: 100%; border: none; }
          </style>
        </head>
        <body>
          <iframe src=\"${autoEmbedUrl}\" allowfullscreen sandbox=\"allow-same-origin allow-scripts\"></iframe>
        </body>
        </html>
      `);
    } else {
      res.status(500).send("Error processing URL and no fallback could be determined.");
    }
  }
};