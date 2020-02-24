#!/usr/bin/env node
/*jshint esversion: 8 */
'use strict';
/*
  griffin.js is the run script for the mbmbam db
  scraping and indexing project
/*
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
let found, newEps,
    parsed, checked;

(async() => {
  logDirectories.forEach(async(dir) => {
    await justin.cleanup(dir);
  });
  repos.forEach(async(repo) => {
    found = await travis.find(repo);
    newEps = await travis.new(found);
    gotten.push(...await travis.get(repo, newEps));
    processed++;
    if(processed === repos.length) {
      justin.write('gotten', gotten);
      parsed = await travis.parse(gotten);
      checked = await travis.check(parsed);
      checked = await travis.add('download url', checked)
      justin.stats(checked);
      indicies.push(...await travis.format('episodes', checked))
      indicies.push(...await travis.format('quotes', checked))
      indicies = await travis.id(indicies);
      console.log('Now Indexing Data');
      await justin.index(indicies);
   }
  });
})();
