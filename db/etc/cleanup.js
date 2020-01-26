#!/usr/bin/env node
/*jshint esversion: 8 */

/*

  This file is intended to be run manually
  when a log file cleanup is need for
  whatever reason.

*/

/* Dependencies */
const justin = require('../lib/justin');

/* Global Variables */
const logDirectories = ['../logs/console/', '../logs/data/'];

(async() => {
  if (typeof process.argv[2] == 'number') {
    logDirectories.forEach(async(dir) => {
      await justin.cleanup(dir, process.argv[2]);
    });
  } else {
    logDirectories.forEach(async(dir) => {
      await justin.cleanup(dir);
    });
  }
})();
