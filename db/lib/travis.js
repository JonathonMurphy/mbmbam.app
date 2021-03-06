#!/usr/bin/env node
/*jshint esversion: 8 */
"use strict";
/*
  travis.js is a custom library for scraping,
  formatting and indexing MBMBaM quotes from the web
/*
/* Dependencies */
const Wikiaapi = require('nodewikiaapi'),
      wiki = 'http://mbmbam.wikia.com',
      puppeteer = require('puppeteer-extra'),
      mywiki = new Wikiaapi('mbmbam'),
      rp = require('request-promise'),
      chokidar = require('chokidar'),
      hash = require('object-hash'),
      cheerio = require('cheerio'),
      justin = require('./justin'),
      regex = require('./regex'),
      log4js = require('log4js'),
      pdf = require('pdf-parse'),
      path = require('path');


/* Logging configuration */
// TODO: Add in an appender that will
// send out an email to us if certain conditions are met
let today = new Date();
today = `${today.getFullYear()}.${today.getMonth()+1}.${today.getDate()}`;
log4js.configure({
  appenders: {
    travis: { type: 'file', filename: path.resolve(__dirname, `../logs/console/${today}.travis.log`) },
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
    default: { appenders: ['travis', 'console'], level: 'info' },
    console: { appenders: ['console'], level: 'info'  },
    off: { appenders: ['console'], level: 'off'  }
  }
});
let logger;

/* Exported Functions */
module.exports.find = (source, logging=true) => {
  /**

  Locates trancripts URL addresses for a particular source

  Returns an array of objects containing
    source: source of the transcript
    title: title of the episode
    number: episode number
    transcript_url: url the transcript  is from

  **/
  if (logging) {
    logger = log4js.getLogger();
  } else {
    logger = log4js.getLogger('off');
  }
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
              justin.write(`1.${funcName}.${source}`, array);
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
            justin.write(`1.${funcName}.${source}`, array);
          }
          resolve(array);
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
              justin.write(`1.${funcName}.${source}`, array);
            }
            resolve(array);
          } catch (error) {
            logger.info(error);
            reject(error);
          }
        })();
        break;
      case 'pdf':
        (async () => {
          let array = [];
          let pageNumber = 1;
          let repoAddress = 'https://maximumfun.org/podcasts/my-brother-my-brother-and-me/?_post-type=transcript&_paged=';
          function createAddress (addr, num) {
            num = num.toString();
            return `${addr}${num}`;
          }
          function recursiveRequest() {
            let options = {
              uri: createAddress (repoAddress, pageNumber),
              transform: function(body) {
                return cheerio.load(body);
              }
            };
            rp(options)
              .then(function ($) {
                let transcriptElements = $('.col-xl-3.col-lg-4.col-md-4.col-sm-6.col-6.latest-panel-loop-item');
                transcriptElements.each(function (i, elem) {
                  let transcriptData = $(this).children('.latest-panel-loop-item-title').find('a');
                  let episodeObject = new justin.Episode(
                    source,
                    transcriptData.text(),
                    transcriptData.attr('href')
                  );
                  array.push(episodeObject);
                });
                if (transcriptElements.length > 0) {
                  pageNumber++;
                  recursiveRequest();
                } else {
                  if (logging) {
                    justin.write(`1.${funcName}.${source}`, array);
                  }
                  resolve(array);
                }
              })
              .catch((error) => reject(error));
          }
          recursiveRequest();
        })();
        break;
      default:
        logger.error(`Uh oh, ${funcName} was called without a valid source`);
        reject();
    }
  });
};
module.exports.get = (source, episodeObjects, logging=true) => {
  /**

  Pulls the raw HTML/Text for the episode URL given in
  the 'source' argument, and adds it to the episodeObject

  Returns an array of objects containing
    source: source of the transcript
    title: title of the episode
    number: episode number
    transcript_url: url the transcript  is from
    html: raw scrapped data of the transcript

  **/
  if (logging) {
    logger = log4js.getLogger();
  } else {
    logger = log4js.getLogger('off');
  }
  return new Promise(function (resolve, reject) {
    let funcName = 'get';
    switch(source) {
      case 'wikia transcript':
        (async () => {
          let processed = 0;
          episodeObjects.forEach((episode, i, array) => {
            logger.info(`
Scrapping ${source} page ${i+1} / ${episodeObjects.length}
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
                processed++;
                if(processed === array.length) {
                  if (logging) {
                    justin.write(`3.${funcName}.${source}`, episodeObjects);
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
            for (let i=0; i<episodeObjects.length; i++) {
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
              logger.info(`
Scrapping ${source} page ${i+1} / ${episodeObjects.length}
URL: ${episodeObjects[i].transcript_url}
Title: ${episodeObjects[i].title}
                `);
              // Add the pages HTML to the episodeObject
              episodeObjects[i].html = $('#contents').html();
              //  Close current page
              await page.close();
            } // End for loop
            await browser.close();
            if (logging) {
              justin.write(`3.${funcName}.${source}`, episodeObjects);
            }
            resolve(episodeObjects);
          } catch (error) {
            await browser.close();
            logger.info(error);
          }
        })();
        break;
      case 'pdf':
        (async () => {
          try {
            let processed = 0;
            episodeObjects.forEach(async (episode, i, array) => {
                let $ = await rp({
                    uri: episode.transcript_url,
                    transform: function(body) {
                      return cheerio.load(body);
                    }
                  });
                let pdfUrl = $('.btn-transcript-download').attr('href');
                let response = await rp({
                    uri: pdfUrl,
                    method: 'GET',
                    encoding: null,
                    headers: {
                      'Content-type': 'application/pdf'
                    }
                  });
                let buffer = Buffer.from(response);
                let data = await pdf(buffer);
                episode.html = data.text;
                logger.info(`
Scrapping ${source} page ${i+1} / ${episodeObjects.length}
URL: ${episodeObjects[i].transcript_url}
Title: ${episodeObjects[i].title}
                  `);
                processed++;
                if (processed === episodeObjects.length) {
                  if (logging) {
                    justin.write(`3.${funcName}.${source}`, episodeObjects);
                  }
                  resolve(episodeObjects);
                }
              });
          }
          catch (err) {
            console.error(err);
          }

        })();
        break;
      default:
        logger.error(`Uh oh, ${funcName} was called without a valid source`);
    }
  });
};
module.exports.parse = (episodeObjects, logging=true) => {
  /**

  Parses the raw scraped data of a given transcript,
  and returns the object with the object.quotes field
  populated with the parsed data of the transcript.


  Returns an array of objects containing
  Returns an array of objects containing
    source: source of the transcript
    title: title of the episode
    number: episode number
    transcript_url: url the transcript  is from
    html: raw scrapped data of the transcript
    quotes: object where the keys are the speaks
      of a quote, and the values are an array of
      all the quotes that speaker has said

  todo: add in error messages when an episode is not parsed.

  **/
  if (logging) {
    logger = log4js.getLogger();
  } else {
    logger = log4js.getLogger('off');
  }
  return new Promise(function (resolve, reject) {
    let funcName = 'parse';
    let processed = 0;
    episodeObjects.forEach((episode, i) => {
      logger.info(`
Parsing page ${i+1} / ${episodeObjects.length}
URL: ${episode.transcript_url}
Title: ${episode.title}
Source: ${episode.source}
        `);
      switch(episode.source) {
        case 'wikia transcript':
          (async () => {
            try {
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
              const $ = cheerio.load(episode.html);
              let str;
              $('span').each(function(i, elem){
                str += $(this).text() + '\n';
              });
              let regexMatches = justin.sting2array(str, regex.superQuote);
              if (regexMatches !== null) {
                regexMatches.forEach(function(match) {
                  justin.sortQuote(match, episode);
                });
              }
              processed++;
            } catch (error) {
              logger.error(error);
              reject(error);
            }
          })();
          break;
        case 'pdf':
          (async () => {
            try {
              let regexMatches = justin.sting2array(episode.html, regex.pdfFilter);
              if (regexMatches !== null) {
                regexMatches.forEach(function(match) {
                  justin.sortQuote(match, episode);
                });
              }
              processed++;
            }
            catch (error) {
              logger.error(error);
              reject(error);
            }
          })();
          break;
        default:
          logger.error(`Uh oh, ${funcName} was called without a valid source`);
      }
      if(processed === episodeObjects.length) {
        if (logging) {
          justin.write(`4.${funcName}`, episodeObjects);
        }
        resolve(episodeObjects);
     }
   });
 });
};
module.exports.check = (episodeObjects, logging=true) => {
/*

  Checks that all the episodes within the array have atleast one quote
  and that there are no duplicate's.
    In the event of a duplicate it favors in this orders
      PDF -> Google Docs -> Wikia Transcripts

      THAT'S A LIE... Currently there's no preference to which is removed
      it just happens to remove them in that order, most of the time

  Returns an array containing no duplicate episodes
  and no episodes with empty quote sections

*/
  if (logging) {
    logger = log4js.getLogger();
  } else {
    logger = log4js.getLogger('off');
  }
  return new Promise(function (resolve, reject) {
    let noQuotes = [];
    episodeObjects.sort((a, b) => {
      return a.number - b.number;
    });
    justin.write('sorted', episodeObjects);
    episodeObjects.forEach(function(episode, i) {
      if (i+1 < episodeObjects.length) {
        if (episode.number == episodeObjects[i+1].number && episode.number !== 0) {
          logger.info(`
Duplicate Found!
${episode.number}: ${episode.transcript_url}
${episodeObjects[i+1].number}: ${episodeObjects[i+1].transcript_url}
`);
          episodeObjects.splice(i, 1);
        }
        if (Object.keys(episode.quotes).length === 0) {
          logger.info(`
Empty episode removed
${episode.number}: ${episode.transcript_url}
`);
          noQuotes.push(episode);
          episodeObjects.splice(i, 1);
        }
      }
    });
    if (logging) {
      justin.write('5.noQuotes', noQuotes);
      justin.write('5.checked', episodeObjects);
    }
    resolve(episodeObjects);
  });
};
module.exports.new = (source, episodeObjects, logging=true) => {
  /**

  Checks for new episodes that have not yet been indexed

  This is yet to be implemented, but the idea is to build a
  new index in Elasticsearch that contains all previously
  indexed episodes, and to query against it for each episode
  that the scripts pulls quotes for

  **/
  if (logging) {
    logger = log4js.getLogger();
  } else {
    logger = log4js.getLogger('off');
  }
  return new Promise(function(resolve, reject) {
    (async()=> {
      let funcName = 'new';
      let processed = 0;
      let array = [];
      episodeObjects.forEach(async (episode) => {
        let res = await justin.search('episodes', episode.number);
        if (res.length == 0) {
          logger.info(res);
          array.push(episode);
        }
        processed++;
        if(processed === episodeObjects.length) {
          if (logging) {
            justin.write(`2.${source}.${funcName}`, array);
          }
          resolve(array);
        }
      });
    })();
  });
};
module.exports.add = (string, episodeObjects, logging=true) => {
  /**

  Adds new properties to the episode object

  **/
  if (logging) {
    logger = log4js.getLogger();
  } else {
    logger = log4js.getLogger('off');
  }
  // This is going to need more work
  // Taken from addDownloadUrl.js
  return new Promise(function(resolve, reject) {
    let funcName = 'add';
    switch(string) {
      case 'download url':
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
        let regexConstructor = (match) => {
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
            episodeObjects.forEach(function(episode) {
              let findUrlRegex = regexConstructor(episode.number);
              links.forEach(function(link) {
                if (link.match(findUrlRegex) != null) {
                  episode.download_url = link;
                }
              });
            });
          })
          .then(() => {
            justin.write(`6.${funcName}`, episodeObjects);
            resolve(episodeObjects);
          })
          .catch((err) => {
            logger.error(err);
            reject(err);
          });
        break;
      default:
        logger.error(`Uh oh, ${funcName} was called without a valid source`);
    }
  });


};
module.exports.format = (type, episodeObjects, logging=true) => {
  /**

    This function takes the finished array of parsed
    non-empty episodes and returns an new array of
    objects that are ready to be indexed into Elasticsearch.

    arguments:
      type:
        'quote'
          Builds an array of objects to be
          indexed into the quote type
        'episode'
          Builds an array of objects to be
          indexed into the episode type
      episodeObjects:
        Array contiaining parsed and checked
        Episode objects


  **/
  if (logging) {
    logger = log4js.getLogger();
  } else {
    logger = log4js.getLogger('off');
  }
  return new Promise(function (resolve, reject) {
    let funcName = 'format';
    let index = [];
    switch (type) {
      case 'quotes':
        episodeObjects.forEach(function(episode) {
          Object.keys(episode.quotes).forEach(function (speaker) {
            let quotes = episode.quotes[speaker];
            quotes.forEach(function(quote) {
              let newQuote = new justin.Index('quote', episode, speaker, quote);
              index.push(newQuote);
            });
          });
        });
        break;
      case 'episodes':
        episodeObjects.forEach(function(episode) {
          let newEpisode = new justin.Index('episode', episode);
          index.push(newEpisode);
        });
        break;
      default:
        resolve(index);
    }
    if (logging) {
      justin.write(`7.${funcName}.${type}`, index);
    }
    resolve(index);
  });
};
module.exports.id = (indexObjects, logging=true) => {
/*

  Takes a hash of an indexes episode number,
  speaker, and quote, and assigned it as the id
  for that index.

  This will prevent Elasticsearch from indexing
  the same quotes twice

*/
  if (logging) {
    logger = log4js.getLogger();
  } else {
    logger = log4js.getLogger('off');
  }
  return new Promise(function (resolve, reject) {
    let index = [];
    let indexObject;
    let funcName = 'id';
    let processed = 0;
    for (indexObject of indexObjects) {
      indexObject.id = hash([
        indexObject.body.title,
        indexObject.body.number,
        indexObject.body.speaker,
        indexObject.body.quote
      ]);
      index.push(indexObject);
      processed++;
      if(processed === indexObjects.length) {
        if (logging) {
          justin.write(`8.${funcName}`, index);
        }
        resolve(index);
      }
    }
  });
};
