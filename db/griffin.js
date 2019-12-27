#!/usr/bin/env node
/*jshint esversion: 8 */

/* Dependencies */
const justin = require('./lib/justin'),
      travis = require('./lib/travis'),
      fs = require('fs');

/* Global Variables */
const repos = ['wikia', 'gdoc'];

let found,
    gotten = [],
    parsed,
    processed = 0;

(async() => {
  repos.forEach(async(repo) => {
    found = JSON.parse(fs.readFileSync(`./logs/12.26.2019.findTranscripts.${repo}.log.json`));
    if (travis.checkForNew(repo)) {
      gotten.push(...await travis.getTranscripts(repo, found));
    }
    processed++;
    if(processed === repos.length) {
      justin.write('gotten', gotten);
   }
  });
  // parsed = await travis.parseTranscripts(gotten);
})();
