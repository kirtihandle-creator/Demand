function isValidUrl(input) {
  if (typeof input !== 'string' || input.length > 2048) return false;
  try {
    const url = new URL(input);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function isValidCode(code) {
  return typeof code === 'string' && /^[A-Za-z0-9]{4,12}$/.test(code);
}

module.exports = { isValidUrl, isValidCode };
