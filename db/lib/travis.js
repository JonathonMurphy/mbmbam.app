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

module.exports.scratchpad = (data) => {
  new Promise((resolve, reject) => {
    console.log(data);
    resolve(data);
  });
};

// This one works
module.exports.findTranscripts = (source) => {
  /**

  Locates trancripts URLs addresses for a particular source

  Returns an array of objects containing
    title of the episode
    episode number
    transcript url

  **/
  new Promise(function (resolve, reject) {
    let funcName = 'findTranscripts';
    switch(source) {
      case 'wikia':
        console.log(`${funcName}(${source}) fired.`);
        (async () => {
          let array = [];
          mywiki.getArticlesList({
              limit: 1000
          }).then(function (data) {
            data.items.forEach(function (item, i) {
              if (regex.transcript.test(item.title)) {
                let addressObject = new justin.Episode(
                  source,
                  item.title.replace('/Transcript', ''),
                  wiki + item.url
                )
                array.push(addressObject);
              }
            });
            justin.write(`${source}.${funcName}`, array);
            resolve(array);
          }).catch(function (error) {
            console.error(error);
            reject(error);
          });
        })();
        break;
      case 'gdoc':
        console.log(`${funcName}(${source}) fired.`);
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
                let addressObject = new justin.Episode(
                  source,
                  $(this).children('span').text(),
                  $(this).attr('href')
                );
                array.push(addressObject);
              }
            });
            await browser.close();
            justin.write(`${source}.${funcName}`, array);
            resolve(array);
          } catch (error) {
            console.log(error);
            reject(error);
          }
        })();
        break;
      case 'pdf':
        console.log(`${funcName}(${source}) fired.`);
        (async () => {
          let array = [];
          justin.write(`${source}.${funcName}`, array);
          resolve(array);
        })();
        break;
      default:
        console.log('Something went wrong... uh oh');
    }
  });
};

// Skip this one for now
module.exports.checkForNew = (source, array=null, log=null) => {
  let funcName = 'checkForNew';
  switch(source) {
    case 'wikia':
      // code block
      console.log(`${funcName}(${source}) fired.`);
      return true;
      break;
    case 'gdoc':
      // code block
      console.log(`${funcName}(${source}) fired.`);
      return true;
      break;
    case 'pdf':
      // code block
      console.log(`${funcName}(${source}) fired.`);
      return true;
      break;
    default:
      // code block
  }
};

// Currently working on this one
/*
  Currently changing out the usage of the objects in the script
  The current plan is to use one object from start to finish
  and build on it at each stage of the scrape
*/
module.exports.getTranscripts = (source, episodeObjects) => {
  /**

  Documentation goes here!

  **/
  new Promise(function (resolve, reject) {
    let funcName = 'getTranscripts';
    switch(source) {
      case 'wikia':
        console.log(`${funcName}(${source}) fired.`);
        (async () => {
          let itemsProcessed = 0;
          episodeObjects.forEach((episode, i, array) => {
            console.log(`
              Scrapping ${source} page ${i+1} / ${episodeObjects.length}\n
              URL: ${episode.transcript_url}
              Title: ${episode.title}
              `);
            const options = {
              uri: episode.transcript_url,
              transform: function (body) {
                return cheerio.load(body);
              }
            };
            rp(options)
              .then(function ($) {
                episode.html = $('#WikiaArticle').html();
                itemsProcessed++;
                if(itemsProcessed === array.length) {
                  justin.write(`${source}.${funcName}`, episodeObjects);
                  resolve(episodeObjects);
               }
              }).catch(function (err) {
                console.error(err);
              });
          });
        })();
        break;
      case 'gdoc':
        console.log(`${funcName}(${source}) fired.`);
        (async () => {
          // Fires up puppeteer in headless mode
          const browser = await puppeteer.launch({headless: true});
          try {
            // Loop over all the array items
            for (i=0; i<episodeObjects.length; i++) {
              // Open new page and load current url from the arracy in puppeteer
              const page = await browser.newPage();
              await page.setViewport({
                  width: 1200,
                  height: 10000
              });
              await page.goto(episodeObjects[i].transcript_url);
              // Assigns all the HTML content of the page to a variable and then give cheerio access to it.
              const html = await page.content();
              const $ = cheerio.load(html);
              console.log(`
                Scrapping ${source} page ${i+1} / ${episodeObjects.length}
                URL: ${episodeObjects[i].transcript_url}
                Title: ${episodeObjects[i].title}
                `);
              // Add the pages HTML to the episodeObject
              episodeObjects[i].html = $('#contents').html()
              //  Close current page
              await page.close();
            } // End for loop
            await browser.close();
            justin.write(`${source}.${funcName}`, episodeObjects);
            resolve(episodeObjects);
          } catch (error) {
            await browser.close();
            console.log(error);
          }
        })();
        break;
      case 'pdf':
        console.log(`${funcName}(${source}) fired.`);
        // code block
        break;
      default:
        // code block
    }
  })
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

module.exports.parseTranscripts = (rawTranscriptsObj) => {
  let funcName = 'parseTranscripts';
  switch(source) {
    case 'wikia':
      /*
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
      // }
      */
      console.log(`${funcName}() fired with ${rawTranscriptsObj.source} as the source.`);
      break;
    case 'gdoc':
      // code block
      console.log(`${funcName}() fired with ${rawTranscriptsObj.source} as the source.`);
      break;
    case 'pdf':
      // code block
      console.log(`${funcName}() fired with ${rawTranscriptsObj.source} as the source.`);
      break;
    default:
      // code block
  }
};
