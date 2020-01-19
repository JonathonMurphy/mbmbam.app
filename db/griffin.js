#!/usr/bin/env node
/*jshint esversion: 8 */

/* Dependencies */
const justin = require('./lib/justin'),
      travis = require('./lib/travis'),
      fs = require('fs');

/* Global Variables */
const repos = ['wikia transcript', 'google doc', 'pdf'];
const logDirectories = ['./logs/console/', './logs/data/']

let found;
let gotten = [];
let parsed;
let checked;
let cleaned;
let processed = 0;

(async() => {
  logDirectories.forEach(async(dir) => {
    await justin.cleanup(dir)
  })
  repos.forEach(async(repo) => {
    found = await travis.find(repo);
    if (travis.new(repo)) {
      gotten.push(...await travis.get(repo, found));
    }
    processed++;
    if(processed === repos.length) {
      justin.write('gotten', gotten);
      parsed = await travis.parse(gotten);
      checked = await travis.check(parsed);
      justin.stats(checked);
   }
  });
})();
