#!/usr/bin/env node
/*jshint esversion: 8 */

/*
  justin.js is the helper library
  for the backend portion of this app
/*

/* Dependencies */
const puppeteer = require('puppeteer'),
      rp = require('request-promise'),
      cheerio = require('cheerio'),
      regex = require('./regex'),
      path = require('path'),
      fs = require('fs');

/* Private Variables */
const mcelroyRegex = /(griffin|travis|justin|clint)/;

/* Exported functions */
module.exports.write = (string, data, ext='json') => {
  /*

  string = title of the log file
  data = data to be logged to file
  ext = file extension

  */

  // Get todays date
  let today = new Date();
  let dd = String(today.getDate()).padStart(2, '0');
  let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  let yyyy = today.getFullYear();
  today = mm + '.' + dd + '.' + yyyy;

  // Log action to console
  console.log(`Logging data to ./logs/${today}.${string}.log.${ext}`)

  // Execute action of logging data to file
  switch(ext) {
    case 'json':
      fs.writeFileSync(`./logs/${today}.${string}.log.${ext}`, JSON.stringify(data));
      break;
    default:
      fs.writeFileSync(`./logs/${today}.${string}.log.${ext}`, data);
  }
  // TODO: Add callback functionality
  // // Execute the callback function if one was passed
  // callback();
};
module.exports.log = (text) => {
  // Get todays date
  let today = new Date();
  let dd = String(today.getDate()).padStart(2, '0');
  let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  let yyyy = today.getFullYear();
  today = mm + '.' + dd + '.' + yyyy;
  // Console log the data
  console.log(text);
  // Write data to disk for future troubleshooting
  // This may have to be a stream so that it doesnn't
  // continuously overwrite itself
  fs.writeFile(`./${today}.log`, text)
}
module.exports.sortQuote = (text, object) => {
  // Taken from sortQuotes.js
  let speakerName = text.match(regex.speaker);
  console.log(speakerName);
  if (speakerName != null) {
    speakerName = speakerName[0].replace(/\:/, '');
    speakerName = speakerName.toLowerCase();
    quoteText = text.match(regex.quote);
    quoteText = quoteText[0].trim();
    if (object.quotes.hasOwnProperty(speakerName)) {
      object.quotes[speakerName].push(quoteText);
    } else {
      object.quotes[speakerName] = [quoteText];
    }
  }
};
module.exports.sortQuoteOld = (text, object) => {
  if (text.includes('J:') || text.includes('Justin:')) {
    text = text.replace('J: ', '');
    text = text.replace('Justin:', '');
    object.quotes.justin.push(text);
  } else if (text.includes('T:') || text.includes('Travis:')) {
    text = text.replace('T: ', '');
    text = text.replace('Travis:', '');
    object.quotes.travis.push(text);
  } else if (text.includes('G:') || text.includes('Griffin:')) {
    text = text.replace('G: ', '');
    text = text.replace('Griffin:', '');
    object.quotes.griffin.push(text);
  } else if (text.length !== 0) {
    text = text.replace('[???]: ', '');
    object.quotes.unattributed.push(text);
  }
};
module.exports.createIndexFile = (quotesObj) => {
  // Taken from createIndexFile.js
  let index = [];
  // Need to add a section to determine if the speaker is a McElroy, and a section for the episode download/listen to url
  class IndexObejct {
    constructor(episode, speaker, quote, url_scraped_from, download_url) {
      this.index = 'mbmbam-search',
      this.type = 'quote',
      this.body = {},
      this.body.episode = episode,
      this.body.speaker = speaker,
            this.body.is_mcelroy = mcelroyRegex.test(speaker),
            this.body.quote = quote,
            this.body.url_scraped_from = url_scraped_from,
            this.body.download_url = download_url;
          }
        }
        quotesObj.episodes.forEach(function(episode) {
          for (var speaker in episode.quotes) {
            if (episode.quotes.hasOwnProperty(speaker)) {
              let speakerQuote = episode.quotes[speaker];
              speakerQuote.forEach(function(quote) {
                let newQuote = new IndexObejct (episode.episode, speaker, quote, episode.url, episode.download_url);
                index.push(newQuote);
              });
            }
          }
        });
        return index;
      };
function Episode (s, t, tU, pC=null, html=null, dU=null) {
  /*
    Object constructor to house all the over-arching
    details for a given episode transcript

        s = source
        t = title
        tU = transcript url
        pC= podcast
        dU = download url
  */
  this.source = s;
  if (t !== null) {
    t = t.toString();
    this.title = t;
    if (t.match(regex.episodeNumber)) {
      this.number = Number(t.match(regex.episodeNumber)[0]);
    } else {
      this.number = null;
    }
  } else {
    this.title = null;
    this.number = null;
  }
  this.transcript_url = tU;
  this.podcast = pC;
  this.download_url = dU;
  this.quotes = {};
  this.html = html;
};
module.exports.Episode = Episode;
