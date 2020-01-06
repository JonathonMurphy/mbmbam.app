#!/usr/bin/env node
/*jshint esversion: 8 */
/*
  clint.js preforms unit testing on the other .js
  files within the /db/ directory
/*
/* Dependencies */
const chai = require('chai'),
      assert = chai.assert;

/* Files to test */
const regex = require('../lib/regex'),
      justin = require('../lib/justin'),
      travis = require('../lib/travis');


/* Tests for travis.js */
describe('travis.js', function () {
  describe('travis.find()', function () {
    it('is a function', function() {
      assert.isFunction(travis.find);
    })
  })
  describe('travis.get()', function () {
    it('is a function', function() {
      assert.isFunction(travis.get);
    })
  })
  describe('travis.parse()', function () {
    it('is a function', function() {
      assert.isFunction(travis.parse);
    })
  })
})


/* Tests for justin.js */


/* Tests for regex.js */
