#!/usr/bin/env node
/*jshint esversion: 8 */
'use strict';
/* Dependencies */
const justin = require('../lib/justin'),
      travis = require('../lib/travis'),
      path = require('path'),
      fs = require('fs');

/* Global Variables */
const repos = ['wikia transcript', 'google doc', 'pdf'];
const logDirectories = [
  path.resolve(__dirname, '../logs/console'),
  path.resolve(__dirname, '../logs/data')
];

let gotten = [];
let indicies = [];
let processed = 0;
let found, parsed,
    checked, added;

(async() => {
  logDirectories.forEach(async(dir) => {
    await justin.cleanup(dir);
  });
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
      added = await travis.add('download url', checked)
      justin.stats(checked);
      indicies.push(...await travis.format('episodes', added))
      indicies.push(...await travis.format('quotes', added))
      indicies = await travis.id(indicies);
      console.log('Now Indexing Data');
      await justin.index(indicies);
   }
  });
})();
