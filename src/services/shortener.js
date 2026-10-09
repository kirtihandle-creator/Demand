const { generateCode } = require('../utils/codegen');
const { isValidUrl } = require('../utils/validate');
const config = require('../config');

class Shortener {
  constructor(store) {
    this.store = store;
  }

  shorten(url) {
    if (!isValidUrl(url)) {
      throw new Error('Invalid URL. Only http and https are allowed.');
    }
    let code;
    do {
      code = generateCode(config.codeLength);
    } while (this.store.has(code));

    const record = { url, hits: 0, createdAt: new Date().toISOString() };
    this.store.set(code, record);
    return { code, ...record };
  }

  resolve(code) {
    const record = this.store.get(code);
    if (!record) return null;
    record.hits += 1;
    this.store.set(code, record);
    return record.url;
  }

  stats(code) {
    const record = this.store.get(code);
    return record ? { code, ...record } : null;
  }

  list() {
    return this.store.all();
  }
}

module.exports = Shortener;
