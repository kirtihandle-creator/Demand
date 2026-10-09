const { sendJson, readBody } = require('../utils/http');
const { isValidCode } = require('../utils/validate');

function apiRoutes(shortener, baseUrl) {
  return async function handle(req, res, pathname) {
    if (req.method === 'POST' && pathname === '/api/shorten') {
      let body;
      try {
        body = await readBody(req);
      } catch (err) {
        return sendJson(res, 400, { error: err.message });
      }
      try {
        const link = shortener.shorten(body.url);
        return sendJson(res, 201, { ...link, shortUrl: `${baseUrl}/${link.code}` });
      } catch (err) {
        return sendJson(res, 400, { error: err.message });
      }
    }

    if (req.method === 'GET' && pathname === '/api/links') {
      return sendJson(res, 200, shortener.list());
    }

    if (req.method === 'GET' && pathname.startsWith('/api/stats/')) {
      const code = pathname.slice('/api/stats/'.length);
      if (!isValidCode(code)) return sendJson(res, 400, { error: 'Bad code' });
      const stats = shortener.stats(code);
      return stats ? sendJson(res, 200, stats) : sendJson(res, 404, { error: 'Not found' });
    }

    return false;
  };
}

module.exports = apiRoutes;
