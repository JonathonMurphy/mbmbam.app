#!/usr/bin/env node
/*jshint esversion: 8 */

// Various regular expersions
module.exports = {
  episodeTitle: /MBMBAM\s{1}\d{2,}\:.*/mi,
  episodeNumber: /\d{2,}/,
  transcript: /transcript/i,
  name: /[A-Z]{1}[a-z]{1,6}\:|\b^Justin\b|\b^Travis\b|\b^Griffin\b|\bClint\b/g,
  mcelroy: /(griffin|travis|justin|clint)/,
  gDoc: /\bPublished on\b|\bListen here on\b|/gi, // could maybe be merged with 'filter'
  quote: /(?<speaker>(?<threeNames>[A-Z]{1}[a-zA-Z]*\s{1}[A-Z]{1}[a-zA-Z]*\s{1}[A-Z]{1}[a-zA-Z]*\s*)|(?<twoNames>[A-Z]{1}[a-zA-Z]*\s{1}[a-zA-Z]*\s*)|(?<oneName>[A-Z]{1}[a-zA-Z]*\s*))(?<lines>\:\s*.*\s*[^A-Z]*)/gm,
  filter: /\byahoo\b|\bsponsored\b|\bmbmbam\|\bhousekeeping\b|\boriginally released\b|\bepisode\b|\bSuggested talking points\b|\bintro\b|\bMy Brother My Brother and Me\b|\b.*,.*,.*,.*\b/gi,
  replace: /\[.*\]/g,
  newlines:  /\r?\n|\r/g,
  timeStamp: /[0-9]{1,2}:+[0-9]{2}/gm,
};
