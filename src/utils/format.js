const UNITS = [
  { name: 'year', ms: 365 * 24 * 60 * 60 * 1000 },
  { name: 'month', ms: 30 * 24 * 60 * 60 * 1000 },
  { name: 'day', ms: 24 * 60 * 60 * 1000 },
  { name: 'hour', ms: 60 * 60 * 1000 },
  { name: 'minute', ms: 60 * 1000 },
  { name: 'second', ms: 1000 },
];

/**
 * Turn an ISO timestamp (or Date) into "3 minutes ago" style text.
 */
function timeAgo(value, now = Date.now()) {
  const then = value instanceof Date ? value.getTime() : Date.parse(value);
  if (Number.isNaN(then)) return 'unknown';

  const diff = Math.max(0, now - then);
  for (const unit of UNITS) {
    const amount = Math.floor(diff / unit.ms);
    if (amount >= 1) {
      return `${amount} ${unit.name}${amount === 1 ? '' : 's'} ago`;
    }
  }
  return 'just now';
}

/**
 * Shorten a long URL for display, keeping the host visible.
 * "https://example.com/a/very/long/path" -> "example.com/a/very/lo..."
 */
function truncateUrl(url, maxLength = 40) {
  let display;
  try {
    const parsed = new URL(url);
    display = parsed.host + parsed.pathname + parsed.search;
  } catch {
    display = String(url);
  }
  if (display.length <= maxLength) return display;
  return `${display.slice(0, Math.max(0, maxLength - 3))}...`;
}

/**
 * "1234567" -> "1,234,567"
 */
function formatCount(n) {
  return Number(n).toLocaleString('en-US');
}

module.exports = { timeAgo, truncateUrl, formatCount };
