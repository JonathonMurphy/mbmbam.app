#!/usr/bin/env node
/*jshint esversion: 8 */

// travis.js is a custom library for scraping
// MBMBaM quotes from the web

/* Dependencies */
const Wikiaapi = require('nodewikiaapi'),
      wiki = 'http://mbmbam.wikia.com',
      puppeteer = require('puppeteer'),
      mywiki = new Wikiaapi('mbmbam'),
      rp = require('request-promise'),
      cheerio = require('cheerio'),
      justin = require('./justin'),
      regex = require('./regex'),
      path = require('path'),
      fs = require('fs');

// This one works
module.exports.findTranscripts = (source) => {
  /**

  Locates trancripts url addresses from a particular source
  Returns an array

  **/
  let funcName = 'findTranscripts';
  switch(source) {
    case 'wikia':
      (function () {
        let array = [];
        mywiki.getArticlesList({
            limit: 1000
        }).then(function (data) {
          data.items.forEach(function (item, i) {
            if (regex.transcript.test(item.title)) {
              array.push(item);
            }
          });
          justin.log(`${source}.${funcName}`, array);
          return array;
        }).catch(function (error) {
          console.error(error);
        });
      })();
      break;
    case 'gdoc':
      (async () => {
        try {
          let array = [];
          // Fires up puppeteer in headless mode, and loads up the page.
          const browser = await puppeteer.launch({headless: true});
          const page = await browser.newPage();
          await page.setViewport({
              width: 1200,
              height: 10000,
          });
          await page.goto('https://docs.google.com/document/d/1x7pn2XZp6UxVUD9oOkuweInUKa66KrcmvGt-ISNxJLE/edit');
          // Assins all the HTML content of the page to a variable and then give cheerio access to it.
          let html = await page.content();
          const $ = cheerio.load(html);
          // Gets all the links on the page
          let links = $('#kix-appview').find('a.kix-link');
          // Loops through all the links, pulls the URL out and adds it to the array.
          links.each(function (i, elem) {
            if ($(this).attr('href').includes('/edit') !== true) {
              array.push($(this).attr('href'));
            }
          });
          await browser.close();
          justin.log(`${source}.${funcName}`, array);
          return array;
        } catch (error) {
          console.log(error);
        }
      })();
      break;
    case 'pdf':
      (function () {
        let array = [];
        justin.log(`${source}.${funcName}`, array);
        return array;
      })();
      break;
    default:
      console.log('Something went wrong... uh oh');
  }
};

// Skip this one for now
module.exports.checkForNew = (array, log) => {
  switch(source) {
    case 'wikia':
      // code block
      break;
    case 'gdoc':
      // code block
      break;
    case 'pdf':
      // code block
      break;
    default:
      // code block
  }
};

// Currently working on this one
module.exports.getTranscripts = (source, episodeURLs) => {
  /**

  Takes the array of URLs generated from findTranscripts()
  and makes the required call type per the source argument
  to pull the page for scraping

  **/
  let funcName = 'getTranscripts';
  switch(source) {
    case 'wikia':
      (function () {
        let episodes = [];
        let itemsProcessed = 0;
        episodeURLs.forEach((episode, index, array) => {
          let episodeObject = new justin.Episode(
            episode.title.replace('/Transcript', ''), // Title and ep #
            wiki + episode.url // Ep url
          );
          const options = {
            uri: episodeObject.transcript_url,
            transform: function (body) {
              return cheerio.load(body);
            }
          };
          rp(options)
            .then(function ($) {
              episodeObject.html = $.html();
              episodes.push(episodeObject);
              itemsProcessed++;
              if(itemsProcessed === array.length) {
                justin.log(`${source}.${funcName}`, episodes);
                return episodes;
             }
            }).catch(function (err) {
              console.error(err);
            });
        });
      })();
      break;
    case 'gdoc':
      // code block
      break;
    case 'pdf':
      // code block
      break;
    default:
      // code block
  }
};

module.exports.parseTranscripts = (source) => {
  let funcName = 'parseTranscripts';
  switch(source) {
    case 'wikia':
      // code block
      // function ($) {
      //   $('p, u, i').each(function (i, elem) {
      //     let textLength = $(this).text().length;
      //     let text = $(this).text().replace('"', '');
      //     let m;
      //     if ((m = regex.timeStamp.test(text)) == true) {
      //       let subStringSelection = text.substring(0,2);
      //       text.replace(subStringSelection, '');
      //       return text;
      //     }
      //     if ((m = regex.filter.test(text)) == false) {
      //       justin.sortQuote(text, episodeObject.quotes);
      //     }
      //   });
      //   episodes.push(episodeObject);
      // }
      break;
    case 'gdoc':
      // code block
      break;
    case 'pdf':
      // code block
      break;
    default:
      // code block
  }
};
