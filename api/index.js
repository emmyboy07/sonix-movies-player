module.exports = async (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.status(200).send(`
    <!DOCTYPE html>
    <html lang="ro">
    <head>
      <meta charset="UTF-8">
      <title>sonix-movies player api</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        html, body {
          margin: 0;
          padding: 0;
          height: 100%;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
          background-color: black;
          color: #171c24;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .content-wrapper {
          background: #fff;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          max-width: 600px;
          width: 100%;
          box-sizing: border-box;
          text-align: center;
          margin: 20px;
        }

        .section-title {
          font-size: 2rem;
          margin-bottom: 1rem;
          color: #ff0000;
        }

        .script-info p {
          margin-bottom: 1rem;
          line-height: 1.6;
        }

        .script-info code {
          background-color: #eaeef2;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          font-family: monospace;
        }

        .script-info a {
          color: #ff0000;
          text-decoration: none;
        }

        .script-info a:hover {
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <div class="content-wrapper">
        <h1 class="section-title">sonix-movies player api</h1>
        <div class="script-info">
          <p>This API belongs to <strong><a href="https://sonix-movies.vercel.app" target="_blank">sonix movies</a></strong>.</p>
          <p>Do not tamper with or attempt to scrape this API. Unauthorized use is prohibited and may result in access being blocked.</p>
        </div>
      </div>
    </body>
    </html>
  `);
};
