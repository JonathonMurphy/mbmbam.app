#!/usr/bin/env node
/*jshint esversion: 8 */
console.log("We bout to get some data ya'll" + "\n");

const queryString = require('query-string'),
      Wikiaapi = require('nodewikiaapi'),
      wiki = 'http://mbmbam.wikia.com',
      justin = require('./lib/justin'),
      travis = require('./lib/travis'),
      puppeteer = require('puppeteer'),
      rp = require('request-promise'),
      mywiki = new Wikiaapi('mbmbam'),
      regex = require('./lib/regex'),
      cheerio = require('cheerio'),
      path = require('path'),
      fs = require('fs');

const repositories = ['wikia', 'gdoc', 'pdf'];

repositories.forEach(function (repo) {
  travis.findTranscripts(repo);
})
