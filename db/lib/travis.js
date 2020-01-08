#!/usr/bin/env node
/*jshint esversion: 8 */
/*
  travis.js is a custom library for scraping
  MBMBaM quotes from the web
/*
/* Dependencies */
const Wikiaapi = require('nodewikiaapi'),
      wiki = 'http://mbmbam.wikia.com',
      puppeteer = require('puppeteer'),
      mywiki = new Wikiaapi('mbmbam'),
      rp = require('request-promise'),
      cheerio = require('cheerio'),
      justin = require('./justin'),
      regex = require('./regex'),
      log4js = require('log4js');


/* Logging configuration */
// TODO: Add in an appender that will
// send out an email to us if certain conditions are met
let today = new Date();
today = `${today.getFullYear()}.${today.getMonth()+1}.${today.getDate()}`;
log4js.configure({
  appenders: {
    travis: { type: 'file', filename: `logs/console/${today}.travis.log` },
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
    default: { appenders: ['travis', 'console'], level: 'info' }
  }
});
let logger;

/* Exported Functions */
module.exports.find = (source, logging=true) => {
  /**

  Locates trancripts URLs addresses for a particular source

  Returns an array of objects containing
    source of the transcript
    title of the episode
    episode number
    transcript url

  **/
  if (logging) {logger = log4js.getLogger()};
  return new Promise(function (resolve, reject) {
    let funcName = 'find';
    switch(source) {
      case 'wikia transcript':
        (async () => {
          let array = [];
          mywiki.getArticlesList({
              limit: 1000
          }).then(function (data) {
            data.items.forEach(function (item, i) {
              if (regex.transcript.test(item.url)) {
                let addressObject = new justin.Episode(
                  source,
                  item.title.replace('/Transcript', ''),
                  wiki + item.url
                );
                array.push(addressObject);
              }
            });
            if (logging) {
              justin.write(`${funcName}.${source}`, array);
            }
            resolve(array);
          }).catch(function (error) {
            logger.error(error);
            reject(error);
          });
        })();
        break;
      case 'wikia article':
        (async () => {
          let array = [];
          if (logging) {
            justin.write(`${funcName}.${source}`, array);
          };
          resolve();
        })();
        break;
      case 'google doc':
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
            if (logging) {
              justin.write(`${funcName}.${source}`, array);
            };
            resolve(array);
          } catch (error) {
            if (logging) {logger.info(error)};
            reject(error);
          }
        })();
        break;
      case 'pdf':
        (async () => {
          let array = [];
          if (logging) {
            justin.write(`${funcName}.${source}`, array);
          };
          resolve();
        })();
        break;
      default:
        logger.error(`Uh oh, ${funcName} was called without a valid source`);
        reject();
    }
  });
};
module.exports.get = (source, episodeObjects,logging=true) => {
  /**

  Pulls the raw HTML for the episode URL given in the 'source'
  argument, and adds it to the episodeObject

  Returns an array of objects containing
    source of the transcript
    title of the episode
    episode number
    transcript url
    raw scrapped data of the transcript

  **/
  if (logging) {logger = log4js.getLogger()};
  return new Promise(function (resolve, reject) {
    let funcName = 'get';
    switch(source) {
      case 'wikia transcript':
        (async () => {
          let itemsProcessed = 0;
          episodeObjects.forEach((episode, i, array) => {
            if (logging) {
              logger.info(`
Scrapping ${source} page ${i+1} / ${episodeObjects.length}
URL: ${episode.transcript_url}
Title: ${episode.title}
                `);
            };
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
                  if (logging) {
                    justin.write(`${funcName}.${source}`, episodeObjects);
                  }
                  resolve(episodeObjects);
               }
              }).catch(function (err) {
                logger.error(err);
              });
          });
        })();
        break;
      case 'wikia article':
        // code block
        break;
      case 'google doc':
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
              if (logging) {
                logger.info(`
Scrapping ${source} page ${i+1} / ${episodeObjects.length}
URL: ${episodeObjects[i].transcript_url}
Title: ${episodeObjects[i].title}
                  `);
              };
              // Add the pages HTML to the episodeObject
              episodeObjects[i].html = $('#contents').html();
              //  Close current page
              await page.close();
            } // End for loop
            await browser.close();
            if (logging) {
              justin.write(`${funcName}.${source}`, episodeObjects);
            };
            resolve(episodeObjects);
          } catch (error) {
            await browser.close();
            if (logging) {logger.info(error)};
          }
        })();
        break;
      case 'pdf':
        // code block
        break;
      default:
        logger.error(`Uh oh, ${funcName} was called without a valid source`);
    }
  });
};
module.exports.parse = (episodeObjects,logging=true) => {
  /**

  Parses the raw scraped data of a given transcript,
  and returns the object with the object.quotes field
  populated with the parsed data of the transcript.


  Returns an array of objects containing
    source of the transcript
    title of the episode
    episode number
    transcript url
    quotes scrapped from the episode
    raw scrapped data of the transcript

  todo: add in error messages when an episode is not parsed.

  **/
  if (logging) {logger = log4js.getLogger()};
  return new Promise(function (resolve, reject) {
    let funcName = 'parse';
    let processed = 0;
    episodeObjects.forEach((episode, i) => {
      switch(episode.source) {
        case 'wikia transcript':
          (async () => {
            try {
              if (logging) {
                logger.info(`
Parsing page ${i+1} / ${episodeObjects.length}
URL: ${episode.transcript_url}
Title: ${episode.title}
Source: ${episode.source}
                  `);
              };
              const $ = cheerio.load(episode.html);
              $('tr').each(function (i, elem) {
                let text = $(this).text().replace(/\n/g, '');
                justin.sortQuote(text, episode);
              });
              processed++;
            } catch (error) {
              logger.error(error);
              reject(error);
            }
          })();
          break;
        case 'wikia article':
          (async () => {
            try {
              let html = episode.html;
              const $ = cheerio.load(html);
              $('p, u, i').each(function (i, elem) {
                let textLength = $(this).text().length;
                let text = $(this).text().replace('"', '');
                let m;
                if ((m = regex.timeStamp.test(text)) == true) {
                  let subStringSelection = text.substring(0,2);
                  text.replace(subStringSelection, '');
                  return text;
                }
                if ((m = regex.filter.test(text)) == false) {
                  justin.sortQuote(text, episode.quotes);
                }
              });
              processed++;
            } catch (error) {
              logger.error(error);
              reject(error);
            }
          })();
          break;
        case 'google doc':
          (async () => {
            try {
              if (logging) {
                logger.info(`
Parsing page ${i+1} / ${episodeObjects.length}
URL: ${episode.transcript_url}
Title: ${episode.title}
Source: ${episode.source}
                  `);
              };
              const $ = cheerio.load(episode.html);
              let str;
              $('span').each(function(i, elem){
                str += $(this).text() + '\n';
              });
              let regexMatches = [];
              regexMatches = str.match(regex.superQuote);
              regexMatches.map(function(entry, index, array){
                array[index] = entry.replace(/\r?\n|\r/g, '');
              });
              regexMatches.forEach(function(match) {
                justin.sortQuote(match, episode);
              });
              processed++;
            } catch (error) {
              logger.error(error);
              reject(error);
            }
          })();
          break;
        case 'pdf':
          // code block
          break;
        default:
          logger.error(`Uh oh, ${funcName} was called without a valid source`);
      }
      if(processed === episodeObjects.length) {
        if (logging) {
          justin.write(`${funcName}`, episodeObjects);
        };
        resolve(episodeObjects);
     }
   });
 });
};
module.exports.new = (source, array=null, prev=null, logging=true) => {
  /**

  Checks for new episodes that have not yet been indexed

  **/
  if (logging) {logger = log4js.getLogger()};
  let funcName = 'new';
  switch(source) {
    case 'wikia transcript':
      // code block
      break;
    case 'wikia article':
      // code block
      break;
    case 'google doc':
      // code block
      break;
    case 'pdf':
      // code block
      break;
    default:
      logger.error(`Uh oh, ${funcName} was called without a valid source`);
  }
  return true;
};
module.exports.add = (string, quotesObj, logging=true) => {
  /**

  Adds new properties to the episode object

  **/
  if (logging) {logger = log4js.getLogger()};
  // This is going to need more work
  // Taken from addDownloadUrl.js
  return new Promise(function(resolve, reject) {
    let funcName = 'add';
    switch(string) {
      case 'download url':
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
          .catch((err) => logger.error(err));
        break;
      default:
        logger.error(`Uh oh, ${funcName} was called without a valid source`);
    }
  });


};
