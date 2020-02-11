#!/usr/bin/env node
/*jshint esversion: 8 */
'use strict';
/* Dependencies */
const justin = require('../lib/justin'),
      fs = require('fs');

/* File to pull items from */
let file = JSON.parse(fs.readFileSync('../test/data/test.checked.log.json'));

let threeItems = [file[0], file[1], file[2]];

let data = new justin.Index()
