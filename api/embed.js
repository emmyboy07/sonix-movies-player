const axios = require("axios");
const cheerio = require("cheerio");

module.exports = async (req, res) => {
  const { url, color = "ff0000" } = req.query;

  // Accept only Videasy URLs or parse from vidsrc.xyz embed URLs
  let embedUrl = "";
  let pageTitle = "Videasy Player";

  // Parse movie
  const movieMatch = url && url.match(/\/embed\/movie\/(\d+)/);
  // Parse TV
  const tvMatch = url && url.match(/\/embed\/tv\/(\d+)\/(\d+)-(\d+)/);

  if (movieMatch) {
    embedUrl = `https://player.videasy.net/movie/${movieMatch[1]}?color=${color}`;
    pageTitle = `Videasy Movie ${movieMatch[1]}`;
  } else if (tvMatch) {
    const showId = tvMatch[1];
    const season = tvMatch[2];
    const episode = tvMatch[3];
    embedUrl = `https://player.videasy.net/tv/${showId}/${season}/${episode}?color=${color}`;
    pageTitle = `Videasy TV ${showId} S${season}E${episode}`;
  } else if (
    url &&
    (url.startsWith("https://player.videasy.net/movie/") ||
      url.startsWith("https://player.videasy.net/tv/"))
  ) {
    // Allow direct Videasy URLs, append color if not present
    embedUrl = url.includes("?") ? `${url}&color=${color}` : `${url}?color=${color}`;
  } else {
    return res.status(400).send(
      `<h2>sonix-movies player api</h2>
      <p><strong>Warning:</strong> Invalid or missing URL. Please provide a valid movie or TV embed URL.</p>`
    );
  }

  // Respond with the iframe embed
  res.setHeader("Content-Type", "text/html");
  return res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>${pageTitle}</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body, html { margin: 0; padding: 0; height: 100%; background: #000; overflow: hidden; }
        iframe { width: 100%; height: 100%; border: none; }
      </style>
    </head>
    <body>
      <iframe src="${embedUrl}" allowfullscreen sandbox="allow-same-origin allow-scripts"></iframe>
    </body>
    </html>
  `);
};
