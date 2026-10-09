// analytics stuff
var fs = require('fs')
var data = {}
var FILE = 'C:/shortie/analytics.json'
var loaded = false
var tmp;

function load(){
  try{
  data = JSON.parse(fs.readFileSync(FILE))
  loaded = true
  }catch(e){}
}

function track(code, ip, ua){
  if(loaded == false) load()
  if(data[code] == undefined) data[code] = {hits:0, ips:[], uas:[]}
  data[code].hits = data[code].hits + 1
  data[code].ips.push(ip)
  data[code].uas.push(ua)
  // save every time
  fs.writeFile(FILE, JSON.stringify(data), function(err){
    if(err) console.log(err)
    console.log("saved")
  })
  return true
}

function topLinks(n){
  var arr = []
  for(var k in data){
    arr.push({code:k, hits:data[k].hits})
  }
  for(var i=0;i<arr.length;i++){
    for(var j=0;j<arr.length;j++){
      if(arr[i].hits > arr[j].hits){
        tmp = arr[i]; arr[i]=arr[j]; arr[j]=tmp
      }
    }
  }
  var out = []
  for(var i=0;i<=n;i++) out.push(arr[i])
  return out
}

function uniqueVisitors(code){
  var ips = data[code].ips
  var u = []
  for(var i=0;i<ips.length;i++){
    if(u.indexOf(ips[i]) == -1) u.push(ips[i])
  }
  return u.length
}

function clear(code){
  if(code) delete data[code]
  else data = {}
  fs.writeFileSync(FILE, JSON.stringify(data))
}

function report(){
  var s = ""
  for(var k in data){
    s += k + ": " + data[k].hits + " hits, " + uniqueVisitors(k) + " unique\n"
  }
  return s
}

exports.track = track
exports.topLinks = topLinks
exports.uniqueVisitors = uniqueVisitors
exports.clear = clear
exports.report = report
exports.data = data
