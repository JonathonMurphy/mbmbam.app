#!/usr/bin/env node
/*jshint esversion: 8 */
/*
  clint.js preforms unit testing on the other .js
  files within the /db/ directory
/*
/* Dependencies */
const rp = require('request-promise'),
      chai = require('chai'),
      assert = chai.assert,
      fs = require('fs');

/* Files to test */
const regex = require('../lib/regex'),
      justin = require('../lib/justin'),
      travis = require('../lib/travis');

/* Global Variables */
const todaysDate = new Date();
const today = `${todaysDate.getFullYear()}.${todaysDate.getMonth()+1}.${todaysDate.getDate()}`;
const repos = ['pdf'];
let found = {};
let gotten = {};
let parsed = {};

/* Tests for travis.js */
 describe('travis.js', function () {

  describe('travis.find()', function () {
    this.timeout(20000000000);
    it('is a function', function() {
      assert.isFunction(travis.find);
    });
    repos.forEach(function(repo) {
      it(`${repo}`, async function() {
        found[repo] = await travis.find(repo, false);
        assert.isArray(found[repo]);
      });
      it('\tthe array should contain only objects', function () {
        for (let episode of found[repo]) {
          assert.isObject(episode);
        }
      });
      it(`\t\tepisode.source is ${repo}`, function() {
        for (let episode of found[repo]) {
          assert.equal(episode.source, repo);
        }
      });
      it('\t\tepisode.title is a string', function() {
        for (let episode of found[repo]) {
          assert.isString(episode.title);
        }
      });
      it('\t\tepisode.number is an integer', function() {
        for (let episode of found[repo]) {
          assert.isNumber(episode.number);
        }
      });
      it('\t\tobject.transcript_url is a valid address', function() {
        for (let episode of found[repo]) {
          let options = {
            method: 'GET',
            uri: episode.transcript_url,
            resolveWithFullResponse: true
          };
          rp(options)
            .then(function (response) {
              assert.equal(response.statusCode, 200)
            })
            .catch((err) => console.log(err))
        };
      });
      it(`\t\tall other fields should be 'null' or empty`, function() {
        for (let episode of found[repo]) {
          assert.isNull(episode.podcast);
          assert.isNull(episode.download_url);
          assert.isNull(episode.html);
          assert.isEmpty(episode.quotes);
        }
      });
    }); // end forEach()
  }); // end travis.find() tests

  describe('travis.get()', function () {
    this.timeout(20000000000);
    it('is a function', function() {
      assert.isFunction(travis.get);
    });
    repos.forEach(function(repo) {
      it(`${repo}`, async function() {
        gotten[repo] = await travis.get(repo, found[repo], false);
        assert.isArray(gotten[repo]);
      });
      it('\tthe array should contain only objects', function () {
        for (let episode of gotten[repo]) {
          assert.isObject(episode);
        }
      });
      it(`\t\tepisode.html should contain html`, function() {
        for (let episode of gotten[repo]) {
          // assert something here
        }
      });
      it(`\t\tall other, not previously filled fields should be 'null' or empty`, function() {
        for (let episode of gotten[repo]) {
          assert.isNull(episode.podcast);
          assert.isNull(episode.download_url);
          assert.isEmpty(episode.quotes);
        }
      });
    }); // end forEach()
  }); // end travis.get() tests

  describe('travis.parse()', function () {
    this.timeout(20000000000);
    it('is a function', function() {
      assert.isFunction(travis.parse);
    });
    repos.forEach(function(repo) {
      it(`${repo}`, async function() {
        parsed[repo] = await travis.parse(gotten[repo], false);
        assert.isArray(parsed[repo]);
      });
      it('\tthe array should contain only objects', function () {
        for (let episode of parsed[repo]) {
          assert.isObject(episode);
        }
      });
      it(`\t\tepisode.quotes should contain a quote from Justin`, function() {
        for (let episode of parsed[repo]) {
          // assert something here
        }
      });
      it(`\t\tepisode.quotes should contain a quote from Travis`, function() {
        for (let episode of parsed[repo]) {
          // assert something here
        }
      });
      it(`\t\tepisode.quotes should contain a quote from Griffin`, function() {
        for (let episode of parsed[repo]) {
          // assert something here
        }
      });
      it(`\t\tall other, not previously filled, fields should be 'null' or empty`, function() {
        for (let episode of parsed[repo]) {
          assert.isNull(episode.podcast);
          assert.isNull(episode.download_url);
        }
      });
    }); // end forEach()
  }); // end travis.parse() tests

  describe('travis.new()', function () {

  }); // end travis.new() tests

  describe('travis.add()', function () {

  }); // end travis.add() tests

 });

/* Tests for justin.js */
describe('justin.js', function () {
  let episode = new justin.Episode(
    'google doc',
    'Episode 69: Nice Nice Nice',
    'https://mbmbam.app'
  );
  describe('justin.Episode()', function () {
    it('should be an object', function () {
      assert.isObject(episode);
    });
    it('\thas a string in the "source" field', function () {
      assert.isString(episode.source);
    });
    it('\thas an integer in the "number" field', function () {
      assert.isNumber(episode.number);
    });
    it('\thas an string in the "title" field', function () {
      assert.isString(episode.title);
    });
    it('\thas a valid url in the "transcript_url" field', function () {
      // assert something here
    });
  });

  describe('justin.write()', function () {
    it('is a function', function () {
      assert.isFunction(justin.write);
    });
    it('\tshould log to a file', function () {
      let string = 'unit-test';
      let data = {unit: 'test'};
      let ext = 'json';
      justin.write(
        string,
        data,
        ext,
        false
      );
      let checkFile = fs.readFileSync(`./logs/data/${today}.${string}.log.${ext}`);
      assert.isDefined(checkFile);
    });
  });

  describe('justin.sortQuote()', function () {
    let goodText = 'Griffin: Every second, real time.';
    let badText = 'I once saw a duck eat a dude`s face off.';
    let goodObject = {
      quotes: {}
    };
    let badObject = {
      quotes: {}
    };
    it('is a function', function () {
      assert.isFunction(justin.sortQuote);
    });
    it('\tshould not add the quote to the object given bad data', function () {
      justin.sortQuote(badText, badObject);
      assert.isEmpty(badObject.quotes);
    });
    it('\tshould add the quote to the object given good data', function () {
      justin.sortQuote(goodText, goodObject);
      assert.isNotEmpty(goodObject.quotes);
    });
  });

  // Write these later, but before we start actually implementing them
  /*
  describe('justin.createIndex()', function () {

  });

  describe('justin.index()', function () {

  });

  describe('justin.search()', function () {

  });
  */

  describe('justin.cleanup()', function () {
    it('is a function', function () {
      assert.isFunction(justin.cleanup);
    });
    let x = 5;
    let goodPath = `./test/cleanup/${today}.good-file.txt`;
    let badPath = './test/cleanup/2019.10.11.bad-file.txt';
    fs.writeFileSync(goodPath, 'Hi, this file is good.');
    fs.writeFileSync(badPath, 'this file to have been deleted and the assertion');
    it(`\tshould delete files older than ${x} number of days`, async function() {
      await justin.cleanup('./test/cleanup/', x, false);
      assert.equal(fs.existsSync(badPath), false);
    });
    it(`\tshould not delete files that are not ${x} days old`, async function () {
      assert.equal(fs.existsSync(goodPath), true);
    });
  });
});

/* Tests for regex.js */
describe('regex.js', function () {
  for (let key of Object.keys(regex)) {
    let juice = fs.readFileSync('./lib/justin.js', 'utf8');
    let scraps = fs.readFileSync('./lib/travis.js', 'utf8');
    let reggie = new RegExp(`regex.${key}`);
    it(`regex.${key} should be used in one of the custom libraries`, function () {
      assert.equal(reggie.test(juice) || reggie.test(scraps), true);
    });
  }
});
