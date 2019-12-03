#!/usr/bin/env node
/*jshint esversion: 8 */
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


module.exports.findTranscripts = (source) => {
  // Locates trancripts from a particular source
  // Returns an array
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
              height: 10000
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
      console.log('Something went wrong... uh oh')
  }
};

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

module.exports.getTranscripts = (source, episodeURLs) => {
  // Takes the array of URLs generated from findTranscripts()
  // and makes the required call type per the source argument
  // to pull the page for scraping
  let funcName = 'getTranscripts';
  switch(source) {
    case 'wikia':
      (function (episodeURLs) {
        // Start of new data structure
        mbmbamQuotes.episodes = [];
        episodeURLs.forEach(function (episode, index, array){
          // bar1.increment();
          let quoteObject = {
            url: wiki + episodeURLs[index],
            // This obtusely long value is taking the URLs ending, removing the '/wiki/' part
            // decoding with queryString.parse then  getting the key of the resulting object
            // removing it from an array, and then finally removing the '_' characters and
            // replacing them with spaces
            episode: Object.keys(queryString.parse(episodeURLs[index].substr(6)))[0].replace(/_/g, ' '),
            quotes: {
              justin: [],
              travis: [],
              griffin: [],
              unattributed: []
            }
          };
          const options = {
            uri: 'http://mbmbam.wikia.com' + episodeURLs[index],
            transform: function (body) {
              return cheerio.load(body);
            }
          };

          rp(options)
            .then(function ($) {
              let episodeName = options.uri.replace('http://mbmbam.wikia.com/wiki/', '');
              $('p, u, i').each(function (i, elem) {
                // bar1.increment();
                const regexFilter = /\byahoo\b|\bsponsored\b|\bmbmbam\b|\bhousekeeping\b|\boriginally released\b|\bepisode\b|\bSuggested talking points\b|\bintro\b|\bMy Brother My Brother and Me\b|\b.*,.*,.*,.*\b/gi;
                const regexTimeStamp = /[0-9]{1,2}:+[0-9]{2}/gm;
                let textLength = $(this).text().length;
                let text = $(this).text().replace('"', '');

                let m;
                if ((m = regexTimeStamp.test(text)) == true) {
                  let subStringSelection = text.substring(0,2);
                  text.replace('subStringSelection', '');
                  return text;
                }
                if ((m = regexFilter.test(text)) == false) {
                  // Filters quotes by brother
                  sortQuotes(text, quoteObject);
                }
              }); // End of Filter Selection Section

              mbmbamQuotes.episodes.push(quoteObject);

            }).then(function(){
              fs.writeFileSync(wikiaQuotesPath, JSON.stringify(mbmbamQuotes), function(err) {
                if(err) console.log(err);
              });
            })
            .catch(function (err) {
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
