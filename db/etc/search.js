#!/usr/bin/env node
/*jshint esversion: 8 */

/*

  Standalone script to search the Elasticsearch instance

  Usage:
    search <query>

*/

/* Dependencies */
const justin = require('../lib/justin');


(async() => {
  let hits = await justin.search(process.argv[2], process.argv[3]);
  hits.forEach(function(hit) {
    console.log(hit);
    console.log("\n");
  });
})();
