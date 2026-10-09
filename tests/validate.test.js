const test = require('node:test');
const assert = require('node:assert');
const { isValidUrl, isValidCode } = require('../src/utils/validate');

test('accepts http and https URLs', () => {
  assert.ok(isValidUrl('https://example.com'));
  assert.ok(isValidUrl('http://example.com/path?q=1'));
});

test('rejects non-http URLs and junk', () => {
  assert.equal(isValidUrl('ftp://example.com'), false);
  assert.equal(isValidUrl('not a url'), false);
  assert.equal(isValidUrl(42), false);
});

test('validates codes', () => {
  assert.ok(isValidCode('abc123'));
  assert.equal(isValidCode('a'), false);
  assert.equal(isValidCode('has space'), false);
});
