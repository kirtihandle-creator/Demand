const fs = require('fs');
const path = require('path');
const config = require('../config');

class Store {
  constructor(file = config.dataFile) {
    this.file = file;
    this.links = {};
    this.load();
  }

  load() {
    try {
      this.links = JSON.parse(fs.readFileSync(this.file, 'utf8'));
    } catch {
      this.links = {};
    }
  }

  save() {
    fs.mkdirSync(path.dirname(this.file), { recursive: true });
    fs.writeFileSync(this.file, JSON.stringify(this.links, null, 2));
  }

  get(code) {
    return this.links[code] || null;
  }

  has(code) {
    return Object.prototype.hasOwnProperty.call(this.links, code);
  }

  set(code, record) {
    this.links[code] = record;
    this.save();
  }

  all() {
    return Object.entries(this.links).map(([code, record]) => ({ code, ...record }));
  }
}

module.exports = Store;
