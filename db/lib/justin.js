#!/usr/bin/env node
/*jshint esversion: 8 */

// justin.js is the helper library
// for the webscraping portion of this app

/* Dependencies */
const puppeteer = require('puppeteer'),
      rp = require('request-promise'),
      cheerio = require('cheerio'),
      regex = require('./regex'),
      path = require('path'),
      fs = require('fs');

const mcelroyRegex = /(griffin|travis|justin|clint)/;

// Helper log function
module.exports.log = (string, data, ext='json') => {
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

// Taken from sortQuotes.js
module.exports.sortQuote = (text, object) => {
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

// Taken from createIndexFile.js
module.exports.createIndexFile = (quotesObj) => {
  let index = [];
  // Need to add a section to determine if the speaker is a McElroy, and a section for the episode download/listen to url
  class IndexObejct {
    constructor(episode, speaker, quote, url_scraped_from, download_url) {
      this.index = 'mbmbam-search',
      this.type = 'quote',
      this.body = {},
      this.body.episode = episode,
      this.body.speaker = sp// takes from quoteObject.json
module.exports.quoteObject = {
  url: "",
  download: "",
  episode: "",
  quotes: {}
};

module.exports.episodes = {
  number: undefined,
  title: "",
  transcript_url: "",
  download_url: ""
};eaker,
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

// This is going to need more work
// Taken from addDownloadUrl.js
module.exports.getDownloadURL = (quotesObj) => {
  const epNumRegex = /\d{2,}/;
  const options = {
    uri: 'http://mbmbam.libsyn.com/rss',
    transform: function (body) {
      return cheerio.load(body, {
        xml: {
          withDomLvl1: true,
          normalizeWhitespace: false,
          xmlMode: true,
          decodeEntities: true
        }
      });
    }
  };
  regexConstructor = (match) => {
    const negativeLookBehind = '(?<![0-9])',
          negativeLookAhead = '(?![0-9])';
    if (match < 10) {
      let findEpisodeUrlRegex = `${negativeLookBehind}0${match.toString()}${negativeLookAhead}`;
      return new RegExp(findEpisodeUrlRegex);
    } else {
      let findEpisodeUrlRegex = `${negativeLookBehind}${match.toString()}${negativeLookAhead}`;
      return new RegExp(findEpisodeUrlRegex);
    }
  };
  rp(options)
    .then(($) => {
      let links = [];
      $('link').each(function() {
        links.push($(this).text());
      });
      quotesObj.episodes.forEach(function(episode) {
        let eisodeNumber;
        if (episode.episode.match(epNumRegex) != null) {
          episodeNumber = Number(episode.episode.match(epNumRegex)[0]);
        } else {
          episodeNumber = 'n/a';
        }
        let findUrlRegex = regexConstructor(episodeNumber);
        links.forEach(function(link) {
          if (link.match(findUrlRegex) != null) {
            episode.download_url = link;
          }
        });
      });
    })
    .then(function() {
      return quotesObj;
    })
    .catch((err) => console.error(err));
};


// takes from quoteObject.json
function Episode (t, tU, html=null, dU=null) {
  /*
    // t = title
    // tU = transcript url
    // dU = download url
  */
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
  this.download_url = dU;
  this.html = html;
};
module.exports.Episode = Episode;

module.exports.episodes = {
  number: undefined,
  title: "",
  transcript_url: "",
  download_url: ""
};