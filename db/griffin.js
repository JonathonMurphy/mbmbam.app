#!/usr/bin/env node
/*jshint esversion: 8 */

/*
// Dependencies
// const queryString = require('query-string'),
//       Wikiaapi = require('nodewikiaapi'),
//       wiki = 'http://mbmbam.wikia.com',
//       justin = require('./lib/justin'),
//       travis = require('./lib/travis'),
//       puppeteer = require('puppeteer'),
//       rp = require('request-promise'),
//       mywiki = new Wikiaapi('mbmbam'),
//       regex = require('./lib/regex'),
//       cheerio = require('cheerio'),
//       path = require('path'),
//       fs = require('fs');
*/

/* Dependencies */
const justin = require('./lib/justin'),
      travis = require('./lib/travis'),
      fs = require('fs');


/* Global Variables */
const repos = ['gdoc'];
const episodes = JSON.parse(fs.readFileSync('./logs/12.22.2019.gdoc.findTranscripts.log.json'));

(async () => {
  for (let repo of repos) {
    let readyForParsing = await travis.getTranscripts(repo, episodes);
  }
})();
