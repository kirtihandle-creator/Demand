#!/usr/bin/env node
const Store = require('./services/store');
const Shortener = require('./services/shortener');

const USAGE = `Usage:
  node src/cli.js shorten <url>   Create a short code for a URL
  node src/cli.js list            List all stored links
  node src/cli.js stats <code>    Show hit count for a code`;

function main(argv) {
  const [command, arg] = argv;
  const shortener = new Shortener(new Store());

  switch (command) {
    case 'shorten': {
      const link = shortener.shorten(arg);
      console.log(`${link.code}  ${link.url}`);
      return 0;
    }
    case 'list': {
      const links = shortener.list();
      if (links.length === 0) console.log('No links yet.');
      for (const link of links) {
        console.log(`${link.code}  ${link.hits.toString().padStart(4)} hits  ${link.url}`);
      }
      return 0;
    }
    case 'stats': {
      const stats = shortener.stats(arg);
      if (!stats) {
        console.error(`No link with code "${arg}".`);
        return 1;
      }
      console.log(JSON.stringify(stats, null, 2));
      return 0;
    }
    default:
      console.log(USAGE);
      return command ? 1 : 0;
  }
}

if (require.main === module) {
  try {
    process.exitCode = main(process.argv.slice(2));
  } catch (err) {
    console.error(err.message);
    process.exitCode = 1;
  }
}

module.exports = { main };
