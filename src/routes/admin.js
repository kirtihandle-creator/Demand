const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { sendJson } = require('../utils/http');
const { isValidCode, isValidUrl } = require('../utils/validate');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');

function timingSafeEqual(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Resolve a user-supplied file name inside DATA_DIR, or return null if it escapes.
 */
function safeDataPath(name) {
  if (typeof name !== 'string' || !/^[\w.-]+\.json$/.test(name)) return null;
  const resolved = path.resolve(DATA_DIR, name);
  return resolved.startsWith(DATA_DIR + path.sep) ? resolved : null;
}

/**
 * Admin routes. Every request must carry the token in the Authorization header:
 *   Authorization: Bearer <ADMIN_TOKEN>
 * The token comes from the ADMIN_TOKEN environment variable. If it is unset, the
 * admin routes are disabled entirely.
 */
function adminRoutes(store, token = process.env.ADMIN_TOKEN) {
  return function handle(req, res, pathname) {
    if (!pathname.startsWith('/admin/')) return false;

    if (!token) {
      sendJson(res, 404, { error: 'Not found' });
      return true;
    }

    const header = req.headers.authorization || '';
    const supplied = header.startsWith('Bearer ') ? header.slice(7) : '';
    if (!timingSafeEqual(supplied, token)) {
      sendJson(res, 401, { error: 'Unauthorized' });
      return true;
    }

    const url = new URL(req.url, 'http://localhost');
    const params = url.searchParams;

    if (req.method === 'DELETE' && pathname === '/admin/links') {
      const code = params.get('code');
      if (!isValidCode(code) || !store.has(code)) {
        sendJson(res, 404, { error: 'Not found' });
        return true;
      }
      delete store.links[code];
      store.save();
      sendJson(res, 200, { ok: true });
      return true;
    }

    if (req.method === 'DELETE' && pathname === '/admin/links/all') {
      store.links = {};
      store.save();
      sendJson(res, 200, { ok: true });
      return true;
    }

    if (req.method === 'POST' && pathname === '/admin/export') {
      const target = safeDataPath(params.get('file') || 'export.json');
      if (!target) {
        sendJson(res, 400, { error: 'Invalid file name' });
        return true;
      }
      fs.mkdirSync(DATA_DIR, { recursive: true });
      fs.writeFileSync(target, JSON.stringify(store.links, null, 2));
      sendJson(res, 200, { ok: true, file: path.basename(target) });
      return true;
    }

    if (req.method === 'POST' && pathname === '/admin/import') {
      const source = safeDataPath(params.get('file'));
      if (!source || !fs.existsSync(source)) {
        sendJson(res, 400, { error: 'Invalid or missing file' });
        return true;
      }
      let links;
      try {
        links = JSON.parse(fs.readFileSync(source, 'utf8'));
      } catch {
        sendJson(res, 400, { error: 'File is not valid JSON' });
        return true;
      }
      let count = 0;
      for (const [code, record] of Object.entries(links || {})) {
        if (isValidCode(code) && record && isValidUrl(record.url)) {
          store.links[code] = { url: record.url, hits: Number(record.hits) || 0, createdAt: record.createdAt };
          count += 1;
        }
      }
      store.save();
      sendJson(res, 200, { ok: true, count });
      return true;
    }

    if (req.method === 'PATCH' && pathname === '/admin/links') {
      const code = params.get('code');
      const newUrl = params.get('url');
      if (!isValidCode(code) || !store.has(code)) {
        sendJson(res, 404, { error: 'Not found' });
        return true;
      }
      if (!isValidUrl(newUrl)) {
        sendJson(res, 400, { error: 'Invalid URL' });
        return true;
      }
      store.links[code].url = newUrl;
      store.save();
      sendJson(res, 200, { code, ...store.links[code] });
      return true;
    }

    sendJson(res, 404, { error: 'Not found' });
    return true;
  };
}

module.exports = adminRoutes;
