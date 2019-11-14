#!/usr/bin/env node
// In the future we can use jq to merge the files by the episode title

const fs = require('fs'),
      path = require('path');

const gDocQuotesPath = path.resolve(__dirname, '../quotes/gDocQuotes.json'),
      wikiaQuotesPath = path.resolve(__dirname, '../quotes/wikiaQuotes.json'),
      mergedQuotesPath = path.resolve(__dirname, '../quotes/mergedQuotes.json');

const gDocQuotes = JSON.parse(fs.readFileSync(gDocQuotesPath)),
      wikiaQuotes = JSON.parse(fs.readFileSync(wikiaQuotesPath));

wikiaQuotes.episodes.forEach(function(episode) {
  gDocQuotes.episodes.push(episode)
})

fs.writeFileSync(mergedQuotesPath, JSON.stringify(gDocQuotes))
