const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { compile } = require('./stitch.js');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;
const SECURITY_CONFIG_PATH = path.join(PUBLIC_DIR, 'security_config.json');

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Allowed folders to serve static files from (prevents downloading server configs/keys)
const ALLOWED_DIRECTORIES = [
  'home_portfolio',
  'projects_portfolio',
  'experience_portfolio',
  'contact_portfolio',
  'about_portfolio',
  'blog_portfolio'
];

// Session in-memory store: { token: { expires: timestamp } }
const ACTIVE_SESSIONS = {};
const SESSION_DURATION_MS = 2 * 60 * 60 * 1000; // 2 hours

function cleanSessions() {
  const now = Date.now();
  for (const token in ACTIVE_SESSIONS) {
    if (ACTIVE_SESSIONS[token].expires < now) {
      delete ACTIVE_SESSIONS[token];
    }
  }
}

function getPasscodeHash() {
  if (fs.existsSync(SECURITY_CONFIG_PATH)) {
    try {
      const data = JSON.parse(fs.readFileSync(SECURITY_CONFIG_PATH, 'utf8'));
      return data.passcodeHash || null;
    } catch (e) {
      console.error('Error reading security_config.json:', e);
    }
  }
  return null;
}

function savePasscodeHash(hash) {
  try {
    fs.writeFileSync(SECURITY_CONFIG_PATH, JSON.stringify({ passcodeHash: hash }, null, 2), 'utf8');
    return true;
  } catch (e) {
    console.error('Error saving security_config.json:', e);
    return false;
  }
}

function hashPasscode(passcode) {
  return crypto.createHash('sha256').update(passcode).digest('hex');
}

function verifySession(req) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false;
  const token = authHeader.substring(7);
  cleanSessions();
  if (ACTIVE_SESSIONS[token] && ACTIVE_SESSIONS[token].expires > Date.now()) {
    // slide session window
    ACTIVE_SESSIONS[token].expires = Date.now() + SESSION_DURATION_MS;
    return true;
  }
  return false;
}

const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);

  // CORS Headers (for API safety)
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');

  // Intercept favicon requests cleanly to prevent browser console errors
  if (req.url === '/favicon.ico') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Parse POST body helper
  function readBody(callback) {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      callback(body);
    });
  }

  // --- API Endpoints ---

  // Check if passcode is initialized
  if (req.method === 'GET' && req.url === '/api/passcode-status') {
    const initialized = getPasscodeHash() !== null;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ initialized }));
    return;
  }

  // Set up passcode initially
  if (req.method === 'POST' && req.url === '/api/setup-passcode') {
    readBody(body => {
      try {
        const payload = JSON.parse(body);
        if (!payload.passcode || typeof payload.passcode !== 'string' || payload.passcode.trim().length < 4) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Passcode must be at least 4 characters long.' }));
          return;
        }

        if (getPasscodeHash() !== null) {
          res.writeHead(403, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Passcode has already been initialized.' }));
          return;
        }

        const hash = hashPasscode(payload.passcode.trim());
        if (savePasscodeHash(hash)) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, message: 'Passcode initialized successfully.' }));
        } else {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Failed to save configuration.' }));
        }
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // Verify passcode and return session token
  if (req.method === 'POST' && req.url === '/api/verify-passcode') {
    readBody(body => {
      try {
        const payload = JSON.parse(body);
        if (!payload.passcode) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Passcode required.' }));
          return;
        }

        const storedHash = getPasscodeHash();
        if (!storedHash) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Passcode is not initialized. Please set up a passcode first.' }));
          return;
        }

        const inputHash = hashPasscode(payload.passcode.trim());
        
        // timingSafeEqual protection
        const matches = crypto.timingSafeEqual(
          Buffer.from(storedHash, 'hex'),
          Buffer.from(inputHash, 'hex')
        );

        if (matches) {
          const token = crypto.randomBytes(32).toString('hex');
          ACTIVE_SESSIONS[token] = {
            expires: Date.now() + SESSION_DURATION_MS
          };
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, token }));
        } else {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Incorrect passcode.' }));
        }
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // Save Config - Require Session Token
  if (req.method === 'POST' && req.url === '/api/save-config') {
    if (!verifySession(req)) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Unauthorized: Valid session token required.' }));
      return;
    }

    readBody(body => {
      try {
        const configData = JSON.parse(body);
        const fileContent = `/**
 * portfolioConfig - The single source of truth for all portfolio content.
 * Any update here will be reflected across all components.
 */
export const portfolioConfig = ${JSON.stringify(configData, null, 2)};
`;

        const configPath = path.join(PUBLIC_DIR, 'portfolio_content_config.txt');
        fs.writeFileSync(configPath, fileContent, 'utf8');
        console.log('Successfully wrote updated portfolio_content_config.txt');

        compile();
        console.log('Successfully re-stitched the pages');

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Configuration saved and compiled successfully.' }));
      } catch (err) {
        console.error('Error handling save-config API:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // --- Static File Serving with security constraints ---
  let reqPath = req.url;

  // Root redirects to home portfolio
  if (reqPath === '/' || reqPath === '/index.html') {
    res.writeHead(302, { 'Location': '/home_portfolio/code.html' });
    res.end();
    return;
  }

  // Security check: only allow files inside ALLOWED_DIRECTORIES
  // Find which directory is requested
  const relativePath = reqPath.startsWith('/') ? reqPath.substring(1) : reqPath;
  const targetDir = relativePath.split('/')[0];

  if (!ALLOWED_DIRECTORIES.includes(targetDir)) {
    console.warn(`Block security threat access attempt to: ${reqPath}`);
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden - Access Restricted');
    return;
  }

  // Resolve file path safely
  let filePath = path.join(PUBLIC_DIR, reqPath);

  // Prevent directory traversal attacks
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end('403 Forbidden');
    return;
  }

  // Check if file exists and is not a directory
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`🚀 Portfolio Dev Server is running at:`);
  console.log(`👉 http://localhost:${PORT}`);
  console.log(`\nTo view and edit your portfolio:`);
  console.log(`👉 http://localhost:${PORT}/contact_portfolio/code.html`);
  console.log(`==================================================\n`);
});
