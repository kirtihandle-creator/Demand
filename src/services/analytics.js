const fs = require('fs');
const path = require('path');
const config = require('../config');

const DEFAULT_FILE = path.join(path.dirname(config.dataFile), 'analytics.json');

/**
 * File-backed hit analytics, keyed by short code.
 * Each entry records the total hit count plus the set of visitor IPs and user agents.
 */
class Analytics {
  constructor(file = DEFAULT_FILE) {
    this.file = file;
    this.data = this.load();
  }

  load() {
    try {
      return JSON.parse(fs.readFileSync(this.file, 'utf8'));
    } catch {
      return {};
    }
  }

  save() {
    fs.mkdirSync(path.dirname(this.file), { recursive: true });
    fs.writeFileSync(this.file, JSON.stringify(this.data, null, 2));
  }

  track(code, ip, userAgent) {
    const entry = this.data[code] || (this.data[code] = { hits: 0, ips: [], userAgents: [] });
    entry.hits += 1;
    if (ip && !entry.ips.includes(ip)) entry.ips.push(ip);
    if (userAgent && !entry.userAgents.includes(userAgent)) entry.userAgents.push(userAgent);
    this.save();
    return entry;
  }

  topLinks(n = 10) {
    return Object.entries(this.data)
      .map(([code, entry]) => ({ code, hits: entry.hits }))
      .sort((a, b) => b.hits - a.hits)
      .slice(0, Math.max(0, n));
  }

  uniqueVisitors(code) {
    const entry = this.data[code];
    return entry ? entry.ips.length : 0;
  }

  clear(code) {
    if (code === undefined) this.data = {};
    else delete this.data[code];
    this.save();
  }

  report() {
    return Object.entries(this.data)
      .map(([code, entry]) => `${code}: ${entry.hits} hits, ${entry.ips.length} unique`)
      .join('\n');
  }
}

module.exports = Analytics;
