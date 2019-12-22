#!/usr/bin/env node
/*jshint esversion: 8 */

/* Dependencies */
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

const justin = require('./lib/justin'),
      travis = require('./lib/travis');

/* Global Variables */
const repositories = ['gdoc'];
let transcriptURLs = [];
let transcriptPages = [];

(async () => {
  for (let repo of repositories) {
    transcriptURLs = await travis.findTranscripts(repo);
  }
})();
