#!/usr/bin/env node
/*jshint esversion: 8 */
/*
  regex.js is a library of regular expressions
  for use in the mbmbam.app web scrapping processes
*/
/* Regular Expressions */
module.exports = {
  episodeNumber: /\d{2,}/,
  transcript: /\/transcript/i,
  mcelroy: /(griffin|travis|justin|clint)/,
  superQuote: /(?<speaker>(?<threeNames>[A-Z]{1}[a-zA-Z]*\s{1}[A-Z]{1}[a-zA-Z]*\s{1}[A-Z]{1}[a-zA-Z]*\s*)|(?<twoNames>[A-Z]{1}[a-zA-Z]*\s{1}[a-zA-Z]*\s*)|(?<oneName>[A-Z]{1}[a-zA-Z]*\s*))(?<lines>\:\s*.*\s*[^A-Z]*)/gm,
  speaker: /^[A-Z]{1}[a-zA-Z]*(\s{1}[a-zA-Z]*\:|\:)/,
  quote: /[^(\w)].*/,
  pdfFilter: /.*?(?=\s\n\s\n)/g,
  doubleNewline: /\\[n]\s\\[n]/,
  filter: /\byahoo\b|\bsponsored\b|\bmbmbam\|\bhousekeeping\b|\boriginally released\b|\bepisode\b|\bSuggested talking points\b|\bintro\b|\bMy Brother My Brother and Me\b|\b.*,.*,.*,.*\b/gi,
  timeStamp: /[0-9]{1,2}:+[0-9]{2}/gm,
  // episodeTitle: /MBMBAM\s{1}\d{2,}\:.*/i,
  // name: /[A-Z]{1}[a-z]{1,6}\:|\b^Justin\b|\b^Travis\b|\b^Griffin\b|\bClint\b/g,
  // header : /MBMBAM\s{1}\d{2,}\:.*|My Brother, My Brother and Me:.*/i,
  // gDoc: /\bPublished on\b|\bListen here on\b|/gi, // could maybe be merged with 'filter'
  // replace: /\[.*\]/g,
  // newlines:  /\r?\n|\r/g,
};
