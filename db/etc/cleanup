#!/usr/bin/env node
/*jshint esversion: 8 */

/*

  This file is intended to be run manually
  when a log file cleanup is need for
  whatever reason.

  Usage:
    node cleanup.js
      Cleans out the last five days (The default value)
      of log files

    node cleanup.js [x]
      Where x = a number
      Cleans out the last x number of days worth of
      log files

*/

/* Dependencies */
const justin = require('../lib/justin'),
      path = require ('path');

/* Global Variables */
const logDirectories = [
  path.resolve(__dirname, '../logs/console/'),
  path.resolve(__dirname, '../logs/data/')
];

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
