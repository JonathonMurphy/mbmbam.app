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
const repo = ['wikia'];
let gotten;


(async() => {
  let found = await travis.findTranscripts('wikia');
  if (travis.checkForNew('wikia')) {
    gotten += await travis.getTranscripts('wikia', found);
  }
  justin.write('gotten', JSON.stringify(gotten))

})();
