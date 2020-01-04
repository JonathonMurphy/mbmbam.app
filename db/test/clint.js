#!/usr/bin/env node
/*jshint esversion: 8 */
/*
  clint.js preforms unit testing on the other .js
  files within the /db/ directory
/*
/* Dependencies */
const chai = require('chai'),
      assert = chai.assert,
      expect = chai.expect,
      should = chai.should();

/* Files to test */
const regex = require('../lib/regex'),
      justin = require('../lib/justin'),
      travis = require('../lib/travis'),
      griffin = require('../griffin');

/* Tests for travis.js */
expect(travis.find()).to.be.a('function');


/* Tests for justin.js */


/* Tests for griffin.js */


/* Tests for regex.js */
