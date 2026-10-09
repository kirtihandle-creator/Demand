const http = require('http');
const config = require('./config');
const logger = require('./utils/logger');
const Store = require('./services/store');
const Shortener = require('./services/shortener');
const apiRoutes = require('./routes/api');
const redirectRoute = require('./routes/redirect');
const staticRoute = require('./routes/static');
const { sendJson } = require('./utils/http');

function createServer(options = {}) {
  const store = options.store || new Store();
  const shortener = new Shortener(store);
  const baseUrl = options.baseUrl || `http://${config.host}:${config.port}`;

  const handlers = [staticRoute(), apiRoutes(shortener, baseUrl), redirectRoute(shortener)];

  return http.createServer(async (req, res) => {
    const { pathname } = new URL(req.url, baseUrl);
    logger.info(`${req.method} ${pathname}`);
    try {
      for (const handler of handlers) {
        if ((await handler(req, res, pathname)) !== false) return;
      }
      sendJson(res, 404, { error: 'Not found' });
    } catch (err) {
      logger.error(err.stack || err.message);
      sendJson(res, 500, { error: 'Internal server error' });
    }
  });
}

if (require.main === module) {
  createServer().listen(config.port, () => {
    logger.info(`shortie running at http://${config.host}:${config.port}`);
  });
}

module.exports = { createServer };
