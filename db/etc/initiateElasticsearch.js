#!/usr/bin/env node
/*jshint esversion: 8 */

/*

  Standalone script to create mapping
  in the Elasticsearch instance

*/

/* Dependencies */
const justin = require('../lib/justin');


(async() => {
  await justin.map();
})();
