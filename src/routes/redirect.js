const { isValidCode } = require('../utils/validate');
const { sendJson } = require('../utils/http');

function redirectRoute(shortener) {
  return function handle(req, res, pathname) {
    if (req.method !== 'GET') return false;
    const code = pathname.slice(1);
    if (!isValidCode(code)) return false;

    const url = shortener.resolve(code);
    if (!url) {
      sendJson(res, 404, { error: 'Short link not found' });
      return true;
    }
    res.writeHead(302, { Location: url });
    res.end();
    return true;
  };
}

module.exports = redirectRoute;
