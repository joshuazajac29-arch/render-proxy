const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// ===== MIDDLEWARE =====
// Enable CORS for all routes
app.use(cors());
// Parse JSON bodies
app.use(express.json());

// ===== SECURITY: ALLOWED DOMAINS =====
// ONLY these domains can be accessed through the proxy
// ADD YOUR OWN DOMAINS HERE - this is a whitelist
const allowedDomains = [
  'jsonplaceholder.typicode.com',  // Test API
  'api.github.com',                // GitHub API
  'api.example.com'                // EXAMPLE - replace with your actual API
];

// ===== HEALTH CHECK ENDPOINT =====
// Used by Render to verify server is running
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Proxy server is running',
    timestamp: new Date().toISOString(),
    usage: 'Use /proxy?url=YOUR_API_URL'
  });
});

// ===== MAIN PROXY ENDPOINT =====
app.get('/proxy', async (req, res) => {
  try {
    console.log('Received proxy request');
    
    // Get target URL from query parameter
    const targetUrl = req.query.url;
    
    // Check if URL parameter exists
    if (!targetUrl) {
      console.error('Missing URL parameter');
      return res.status(400).json({ 
        error: 'Missing URL parameter',
        example: '/proxy?url=https://api.example.com/data'
      });
    }

    // Validate URL format
    let targetDomain;
    try {
      const urlObj = new URL(targetUrl);
      targetDomain = urlObj.hostname;
      console.log('Target domain:', targetDomain);
    } catch (e) {
      console.error('Invalid URL format:', targetUrl);
      return res.status(400).json({ 
        error: 'Invalid URL format',
        message: 'Please provide a valid URL with http:// or https://'
      });
    }

    // Check if domain is allowed
    if (!allowedDomains.includes(targetDomain)) {
      console.error('Domain not allowed:', targetDomain);
      return res.status(403).json({ 
        error: 'Domain not allowed',
        requested: targetDomain,
        allowed: allowedDomains,
        message: 'Contact administrator to add this domain to allowed list'
      });
    }

    console.log('Forwarding request to:', targetUrl);
    
    // Forward the request to target API
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Render-Proxy/1.0',
        'Accept': 'application/json',
      },
      timeout: 15000 // 15 second timeout
    });

    // Check if target API responded successfully
    if (!response.ok) {
      console.error('Target API error:', response.status);
      return res.status(response.status).json({
        error: 'Target server error',
        status: response.status,
        statusText: response.statusText
      });
    }

    // Get response data
    const data = await response.json();
    console.log('Successfully proxied request');
    
    // Return data to client
    res.json({
      success: true,
      data: data,
      proxiedFrom: targetUrl
    });

  } catch (error) {
    console.error('Proxy error:', error.message);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message
    });
  }
});

// ===== POST PROXY ENDPOINT =====
app.post('/proxy', async (req, res) => {
  try {
    const targetUrl = req.query.url;
    const body = req.body;

    if (!targetUrl) {
      return res.status(400).json({ error: 'Missing URL parameter' });
    }

    let targetDomain;
    try {
      targetDomain = new URL(targetUrl).hostname;
    } catch (e) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    if (!allowedDomains.includes(targetDomain)) {
      return res.status(403).json({ error: 'Domain not allowed' });
    }

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'User-Agent': 'Render-Proxy/1.0',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      timeout: 15000
        // ===== ROOT ENDPOINT =====
app.get('/', (req, res) => {
  res.json({
    message: 'Render Proxy Server is working! 🎉',
    endpoints: {
      health: '/health',
      proxy: '/proxy?url=YOUR_API_URL',
      example: '/proxy?url=https://jsonplaceholder.typicode.com/posts/1'
    },
    status: 'active'
  });
});
      // ===== POST PROXY =====
app.post('/proxy', async (req, res) => {
  // ... existing code ...
});

// ===== START SERVER =====
app.listen(PORT, () => {
  console.log('🚀 Proxy server started on port', PORT);
});
    });

    const data = await response.json();
    res.status(response.status).json(data);

  } catch (error) {
    console.error('POST Proxy error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ===== START SERVER =====
app.listen(PORT, () => {
  console.log('=== RENDER PROXY SERVER STARTED ===');
  console.log('Server URL: http://localhost:' + PORT);
  console.log('Health check: http://localhost:' + PORT + '/health');
  console.log('Proxy endpoint: http://localhost:' + PORT + '/proxy?url=YOUR_URL');
  console.log('Allowed domains:', allowedDomains);
  console.log('==================================');
});
