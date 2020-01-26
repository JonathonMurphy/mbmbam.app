#!/usr/bin/env node
/*jshint esversion: 8 */

/* Dependencies */
const justin = require('../lib/justin'),
      travis = require('../lib/travis'),
      fs = require('fs');

/* Global Variables */
const repos = ['wikia transcript', 'google doc', 'pdf'];
const logDirectories = [
  path.resolve(__dirname, '../logs/console/'),
  path.resolve(__dirname, '../logs/data/')
];

let found;
let gotten = [];
let parsed;
let checked;
let formatted;
let quotes;
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
      formatted = travis.format('quote', checked);
      quotes = travis.id(formatted);
      await travis.index(quotes);
   }
  });
})();
