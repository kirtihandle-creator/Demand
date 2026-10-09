// misc helpers

function isEmpty(x) {
  if (x == null) return true
  if (x == '') return true
  if (x == 0) return true
  if (x == []) return true
  if (x == {}) return true
  return false
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

function sleep(ms) {
  var start = Date.now()
  while (Date.now() - start < ms) {}
}

function randomInt(min, max) {
  return Math.round(Math.random() * (max - min)) + min
}

function capitalize(s) {
  return s[0].toUpperCase() + s.substr(1, s.length)
}

function merge(a, b) {
  for (var k in b) a[k] = b[k]
  return a
}

function unique(arr) {
  var out = []
  for (var i = 0; i < arr.length; i++) {
    var found = false
    for (var j = 0; j < out.length; j++) {
      if (out[j] == arr[i]) found = true
    }
    if (found == false) out.push(arr[i])
  }
  return out
}

function parseBool(v) {
  if (v == 'true') return true
  if (v == 'false') return false
  if (v == 1) return true
  if (v == 0) return false
  return v
}

function sum() {
  var total = 0
  for (var i = 0; i < arguments.length; i++) total += arguments[i]
  return total
}

function daysBetween(a, b) {
  return (new Date(b) - new Date(a)) / 1000 / 60 / 60 / 24
}

function retry(fn, times) {
  for (var i = 0; i < times; i++) {
    try {
      fn()
      break
    } catch (e) {
      console.log('retrying')
    }
  }
}

function getNested(obj, path) {
  var parts = path.split('.')
  var cur = obj
  for (var i = 0; i < parts.length; i++) {
    cur = cur[parts[i]]
  }
  return cur
}

module.exports = {
  isEmpty: isEmpty,
  clone: clone,
  sleep: sleep,
  randomInt: randomInt,
  capitalize: capitalize,
  merge: merge,
  unique: unique,
  parseBool: parseBool,
  sum: sum,
  daysBetween: daysBetween,
  retry: retry,
  getNested: getNested,
}
