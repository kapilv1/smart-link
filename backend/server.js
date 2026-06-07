// Load local environment variables during development. Vercel injects env vars in deployment.
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = process.env.MONGODB_URI;
let cachedClient = null;

async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient;
  }

  if (!uri) {
    throw new Error('MONGODB_URI environment variable is missing!');
  }

  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  await client.connect();
  cachedClient = client;
  return client;
}

function renderHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>MongoDB Connection Test</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 720px; margin: 2rem auto; padding: 1rem; line-height: 1.6; }
    button { padding: 0.75rem 1.25rem; font-size: 1rem; cursor: pointer; }
    pre { background: #f7f7f7; border-radius: 0.5rem; padding: 1rem; white-space: pre-wrap; word-break: break-word; }
  </style>
</head>
<body>
  <h1>MongoDB Connection Test</h1>
  <p>Click the button to test the MongoDB Atlas connection from this serverless endpoint.</p>
  <button id="checkButton">Check MongoDB connection</button>
  <div id="result" style="margin-top: 1rem;"></div>
  <script>
    const result = document.getElementById('result');
    const button = document.getElementById('checkButton');

    button.addEventListener('click', async () => {
      result.textContent = 'Checking connection...';

      try {
        const response = await fetch('/connection', { cache: 'no-store' });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Request failed');
        }

        result.innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
      } catch (error) {
        result.innerHTML = '<pre>Connection error:\n' + error.message + '</pre>';
      }
    });
  </script>
</body>
</html>`;
}

module.exports = async (req, res) => {
  const path = req.url ? req.url.split('?')[0] : '/';

  if (req.method === 'GET' && (path === '/' || path === '/index.html')) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(renderHtml());
    return;
  }

  if (req.method === 'GET' && path === '/connection') {
    try {
      const client = await connectToDatabase();
      await client.db('admin').command({ ping: 1 });
      res.status(200).json({ success: true, message: 'Successfully connected and pinged MongoDB Atlas!' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
    return;
  }

  res.status(404).json({ success: false, error: 'Not found' });
};
