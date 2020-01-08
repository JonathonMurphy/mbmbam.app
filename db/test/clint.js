#!/usr/bin/env node
/*jshint esversion: 8 */
/*
  clint.js preforms unit testing on the other .js
  files within the /db/ directory
/*
/* Dependencies */
const chai = require('chai'),
      assert = chai.assert,
      rp = require('request-promise');

/* Files to test */
const regex = require('../lib/regex'),
      justin = require('../lib/justin'),
      travis = require('../lib/travis');

/* Global Variables */
const repos = ['wikia transcript', 'wikia article', 'google doc', 'pdf'];
let found = {};

/* Tests for travis.js */
describe('travis.js', function () {

  describe('travis.find()', function () {
    this.timeout(20000000);
    it('is a function', function() {
      assert.isFunction(travis.find);
    });
    repos.forEach(function(repo) {
      it(`returns an array given the source of '${repo}'`, async function() {
        found[repo] = await travis.find(repo, false);
        assert.isArray(found[repo]);
      });
      it('\tthe array should contain only objects', function () {
        for (let episode of found[repo]) {
          assert.isObject(episode);
        };
      });
      // Test when home
      it(`\t\tepisode.source is ${repo}`, function() {
        for (let episode of found[repo]) {
          assert.equal(episode.source, repo);
        };
      });
      it('\t\tepisode.title is a string', function() {
        for (let episode of found[repo]) {
          assert.isString(episode.title);
        };
      });
      it('\t\tepisode.number is an integer', function() {
        for (let episode of found[repo]) {
          assert.isNumber(episode.number);
        };
      });
      // TODO; Implement a test for URL validation
      // it('\t\tobject.transcript_url is a valid address', function() {
      //   for (let episode of found[repo]) {
      //     /*
      //       Make a request to the url from the episode
      //       Maybe make two assert statments
      //         one to check that a sting is in the fields
      //         another to validate the address
      //     */
      //   };
      // });
      it(`\t\tall other fields should be 'null' or empty`, function() {
        for (let episode of found[repo]) {
          assert.isNull(episode.podcast);
          assert.isNull(episode.download_url);
          assert.isNull(episode.html);
          assert.isEmpty(episode.quotes);
        };
      });
    }); // end forEach()
  }); // end travis.find() tests

  describe('travis.get()', function () {
    it('is a function', function() {
      assert.isFunction(travis.get);
    });
  }); // end travis.get() tests

  describe('travis.parse()', function () {
    it('is a function', function() {
      assert.isFunction(travis.parse);
    });
  }); // end travis.parse() tests

});


/* Tests for justin.js */


/* Tests for regex.js */
