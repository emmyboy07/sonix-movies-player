const axios = require("axios");
const cheerio = require("cheerio");

module.exports = async (req, res) => {
  // Default color is #ff0000 (remove # for URL param)
  let { url, color = "#ff0000" } = req.query;
  color = color.replace(/^#/, "");

  let embedUrl = "";
  let pageTitle = "Videasy Player";

  // Parse vidsrc.xyz movie
  const vidsrcMovie = url && url.match(/vidsrc\.xyz\/embed\/movie\/(\d+)/);
  // Parse vidsrc.xyz TV
  const vidsrcTV = url && url.match(/vidsrc\.xyz\/embed\/tv\/(\d+)\/(\d+)-(\d+)/);
  // Parse Videasy movie
  const videasyMovie = url && url.match(/player\.videasy\.net\/movie\/(\d+)/);
  // Parse Videasy TV
  const videasyTV = url && url.match(/player\.videasy\.net\/tv\/(\d+)\/(\d+)\/(\d+)/);

  if (vidsrcMovie) {
    embedUrl = `https://player.videasy.net/movie/${vidsrcMovie[1]}?color=${color}`;
    pageTitle = `Videasy Movie ${vidsrcMovie[1]}`;
  } else if (vidsrcTV) {
    const showId = vidsrcTV[1];
    const season = vidsrcTV[2];
    const episode = vidsrcTV[3];
    embedUrl = `https://player.videasy.net/tv/${showId}/${season}/${episode}?color=${color}`;
    pageTitle = `Videasy TV ${showId} S${season}E${episode}`;
  } else if (videasyMovie) {
    embedUrl = url.includes("?") ? `${url}&color=${color}` : `${url}?color=${color}`;
    pageTitle = `Videasy Movie ${videasyMovie[1]}`;
  } else if (videasyTV) {
    embedUrl = url.includes("?") ? `${url}&color=${color}` : `${url}?color=${color}`;
    pageTitle = `Videasy TV ${videasyTV[1]} S${videasyTV[2]}E${videasyTV[3]}`;
  } else {
    return res.status(400).send(
      `<h2>sonix-movies player api</h2>
      <p><strong>Warning:</strong> Invalid or missing URL. Please provide a valid movie or TV embed URL.<br>
      Supported:<br>
      - https://vidsrc.xyz/embed/movie/&lt;id&gt;<br>
      - https://vidsrc.xyz/embed/tv/&lt;id&gt;/&lt;season&gt;-&lt;episode&gt;<br>
      - https://player.videasy.net/movie/&lt;id&gt;<br>
      - https://player.videasy.net/tv/&lt;id&gt;/&lt;season&gt;/&lt;episode&gt;<br>
      </p>`
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
