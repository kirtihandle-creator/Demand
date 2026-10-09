const path = require('path');

module.exports = {
  port: Number(process.env.PORT) || 3000,
  host: process.env.HOST || 'localhost',
  dataFile: process.env.DATA_FILE || path.join(__dirname, '..', 'data', 'links.json'),
  codeLength: 6,
};
