#!/usr/bin/env node
/*jshint esversion: 8 */
/*
  justin.js is the helper library
  for the backend portion of this app
/*
/* Dependencies */
const regex = require('./regex'),
      log4js = require('log4js'),
      path = require('path'),
      fs = require('fs');

/* Logging configuration */
// TODO: Add in an appender that will
// send out an email to us if certain conditions are met
let today = new Date();
today = `${today.getFullYear()}.${today.getMonth()+1}.${today.getDate()}`;
log4js.configure({
  appenders: {
    justin: { type: 'file', filename: `logs/console/${today}.justin.log` },
    console: { type: 'console'}
    // mailgun: {
    //   type: '@log4js-node/mailgun',
    //   apiKey: '123456abc',
    //   domain: 'some.company',
    //   from: 'logging@some.service',
    //   to: 'important.bosses@some.company',
    //   subject: 'Error: Developers Need To Be Fired'
    // }
  },
  categories: {
    default: { appenders: ['justin', 'console'], level: 'info' }
  }
});
const logger = log4js.getLogger();

/* Exported functions */
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
module.exports.write = (string, data, ext='json') => {
  /*

  string = title of the log file
  data = data to be logged to file
  ext = file extension

  */

  let today = new Date();
  today = `${today.getFullYear()}.${today.getMonth()+1}.${today.getDate()}`;

  // Log action to console
  logger.info(`Logging data to ./logs/data/${today}.${string}.log.${ext}\n`)

  // Execute action of logging data to file
  switch(ext) {
    case 'json':
      fs.writeFileSync(`./logs/data/${today}.${string}.log.${ext}`, JSON.stringify(data));
      break;
    default:
      fs.writeFileSync(`./logs/data/${today}.${string}.log.${ext}`, data);
  }
  // TODO: Add callback functionality
  // // Execute the callback function if one was passed
  // callback();
};
module.exports.sortQuote = (text, object) => {
  /**

  Takes a text string and the episodeObject in as
  arguments. It then parses the text, and breaks
  it down into two components, speaker and quote.

  It then adds the speaker string to the episodeObject
  as a key with an array as it's value and pushes
  the quote string into that array.

  **/
  let quoteText;
  let speakerName = text.match(regex.speaker);
  if (speakerName != null) {
    speakerName = speakerName[0].replace(/\:/, '');
    speakerName = speakerName.toLowerCase();
    quoteText = text.match(regex.quote);
    quoteText = quoteText[0].replace(/\:/, '');
    quoteText = quoteText.trim();
    if (object.quotes.hasOwnProperty(speakerName)) {
      object.quotes[speakerName].push(quoteText);
    } else {
      object.quotes[speakerName] = [quoteText];
    }
    // logger.info(`${speakerName}: ${quoteText}`);
  }

};
module.exports.createIndexFile = (quotesObj) => {
  /**

  Documentation goes here!

  **/
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
            this.body.is_mcelroy = regex.mcelroy.test(speaker),
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
module.exports.cleanup = () => {
/*

  This function is intended to clean up the logs
  sub-directory's when files reach a certain age

*/
}
