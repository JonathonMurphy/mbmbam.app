#!/usr/bin/env node
/*jshint esversion: 8 */

/* Dependencies */
const justin = require('./lib/justin'),
      travis = require('./lib/travis'),
      fs = require('fs');

/* Global Variables */
const repos = ['wikia transcript', 'gdoc'];

let found;
let gotten = [];
let parsed;
let processed = 0;

(async() => {
  repos.forEach(async(repo) => {
    found = await travis.find(repo);
    if (travis.checkForNew(repo)) {
      gotten.push(...await travis.get(repo, found));
    }
    processed++;
    if(processed === repos.length) {
      justin.write('gotten', gotten);
      parsed = await travis.parse(gotten);
   }
  });
})();
