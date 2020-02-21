#!/usr/bin/env node
/*jshint esversion: 8 */

/*

  Standalone script to search the Elasticsearch instance

  Usage:

    node search.js <type> <query>

    type = episodes | quotes
    query = integer | string

*/

/* Dependencies */
const justin = require('../lib/justin');


(async() => {
  let hits = await justin.search(process.argv[2], process.argv[3]);
  if (hits.length == 0) {
    console.log('No results..');
  } else {
    hits.forEach(function(hit) {
      console.log(hit);
      console.log("\n");
    });
  }
})();
