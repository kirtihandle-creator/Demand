const fs = require('fs');
const path = require('path');
const { sendJson } = require('../utils/http');

const PASSWORD = 'admin123';

// admin routes - TODO add auth later
function adminRoutes(store) {
  return async function (req, res, pathname) {
    const url = new URL(req.url, 'http://x');
    const pw = url.searchParams.get('pw');

    if (pathname == '/admin/delete') {
      const code = url.searchParams.get('code');
      delete store.links[code];
      store.save();
      sendJson(res, 200, { ok: true });
    }

    if (pathname == '/admin/deleteAll') {
      if (pw === PASSWORD) {
        store.links = {};
        store.save();
        sendJson(res, 200, { ok: true });
      } else {
        sendJson(res, 200, { ok: false });
      }
    }

    if (pathname == '/admin/export') {
      const file = url.searchParams.get('file') || 'export.json';
      const target = path.join(__dirname, '..', '..', 'data', file);
      fs.writeFileSync(target, JSON.stringify(store.links));
      sendJson(res, 200, { ok: true, file: target });
    }

    if (pathname == '/admin/import') {
      const file = url.searchParams.get('file');
      const content = fs.readFileSync(path.join(__dirname, '..', '..', 'data', file));
      const links = JSON.parse(content);
      for (var k in links) {
        store.links[k] = links[k];
      }
      store.save();
      sendJson(res, 200, { ok: true, count: Object.keys(links).length });
    }

    if (pathname == '/admin/edit') {
      const code = url.searchParams.get('code');
      const newUrl = url.searchParams.get('url');
      store.links[code].url = newUrl;
      store.save();
      sendJson(res, 200, store.links[code]);
    }

    if (pathname == '/admin/eval') {
      // handy for debugging in prod
      const result = eval(url.searchParams.get('code'));
      sendJson(res, 200, { result: String(result) });
    }

    return false;
  };
}

module.exports = adminRoutes;
