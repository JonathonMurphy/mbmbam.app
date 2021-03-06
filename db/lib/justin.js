#!/usr/bin/env node
/*jshint esversion: 8 */
"use strict";
/*
  justin.js is the helper library
  for the backend portion of this app
/*
/* Dependencies */
const { Client } = require('@elastic/elasticsearch'),
      client = new Client({node: 'https://search-mbmbam-jb5nrxn3lk3epnc44z74hgccfu.us-east-2.es.amazonaws.com'}),
      // client = new Client({node: 'http://127.0.0.1:9200'}),
      regex = require('./regex'),
      log4js = require('log4js'),
      path = require('path'),
      fs = require('fs');

/* Global Variables */
const logDir = path.resolve(__dirname, '../logs/data/');
const searchIndex = 'mbmbam-search';

/* Logging configuration */
// TODO: Add in an appender that will
// send out an email to us if certain conditions are met
const todaysDate = new Date();
const today = `${todaysDate.getFullYear()}.${todaysDate.getMonth()+1}.${todaysDate.getDate()}`;
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

/* Exported classes */
class Index {
  constructor (type, episode, speaker=null, quote=null) {
    this.index = searchIndex;
    this.id = null;
    this.body = {};
      this.body.group = type;
      this.body.podcast = episode.podcast;
      this.body.episode = episode.title;
      this.body.number = episode.number;
      this.body.url_scraped_from = episode.transcript_url;
      this.body.download_url = episode.download_url;
      this.body.speaker = speaker;
      if (speaker !== null) {
        this.body.is_mcelroy = regex.mcelroy.test(speaker);
      } else  {
        this.body.is_mcelroy = speaker;
      }
      this.body.quote = quote;
  }
}
module.exports.Index = Index;
class Episode {
  constructor (s, t, tU, pC=null, html=null, dU=null) {
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
        this.number = 0;
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
  }
}
module.exports.Episode = Episode;

/* Exported functions */
module.exports.write = (string, data, ext='json', logging=true) => {
  /*

  string = title of the log file
  data = data to be logged to file
  ext = file extension

  */

  // let today = new Date();
  // today = `${today.getFullYear()}.${today.getMonth()+1}.${today.getDate()}`;

  // Log action to console
  if (logging) {
    logger = log4js.getLogger();
  } else {
    logger = log4js.getLogger('off');
  }
  logger.info(`Logging data to ${logDir}/${today}.${string}.log.${ext}\n`);

  // Execute action of logging data to file
  switch(ext) {
    case 'json':
      fs.writeFileSync(`${logDir}/${today}.${string}.log.${ext}`, JSON.stringify(data));
      break;
    default:
      fs.writeFileSync(`${logDir}/${today}.${string}.log.${ext}`, data);
  }
  // TODO: Add callback functionality
  // // Execute the callback function if one was passed
  // callback();
};
module.exports.sting2array = (string, regExp) => {
  /*

  Converts a string to an array by a given delimiter

  */
  let array = string.match(regExp);
  if (array !==  null) {
    array.map(function(entry, index, array){
      array[index] = entry.replace(/\r?\n|\r/g, '');
    });
  }
  return array;
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
  }

};
module.exports.cleanup = (directory, daysToKeep=35, logging=true) => {
/*

  This function is intended to clean up the logs
  sub-directory's when files reach a certain age

  Takes the directory path as a string, and then
  deletes any files older than daysToKeep days old

*/
if (logging) {
  logger = log4js.getLogger();
} else {
  logger = log4js.getLogger('off');
}
return new Promise(function (resolve, reject) {
  // if (error) {
  //   reject(error);
  // };
  let filenames = fs.readdirSync(directory);
  let processed = 0;
  filenames.forEach((filename) => {
    let filenameArray = filename.split(".");
    const fileDate = new Date(`${filenameArray[0]}/${filenameArray[1]}/${filenameArray[2]}`);
    const diffTime = Math.abs(todaysDate - fileDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > daysToKeep) {
      logger.info(`Removing ${directory}${filename}`);
      fs.unlinkSync(`${directory}/${filename}`);
    }
    processed++;
    if (processed === filenames.length) {
      resolve();
    }
  });
});
};
module.exports.stats = (episodeObjects, logging=true) => {
/*

  Logs stats about the episodeObjects array

*/
if (logging) {
  logger = log4js.getLogger();
} else {
  logger = log4js.getLogger('off');
}

function count (source) {
  let count = 0;
  episodeObjects.forEach(function(object) {
    if (object.source === source) {
      count++;
    }
  });
  return count;
  }
  function episodeNumbers (episodes) {
    let array = [];
    episodes.forEach(function (episode) {
      array.push(episode.number);
    });
    return array;
  }

  let statObject = {
    total: episodeObjects.length,
    wikia: count('wikia transcript'),
    gdoc: count('google doc'),
    pdf: count('pdf'),
    numbers: episodeNumbers(episodeObjects)
  };
  logger.info(`
Total Number of Episodes: ${statObject.total}
  From Wikia Transcripts: ${statObject.wikia}
        From Google Docs: ${statObject.gdoc}
              From PDF's: ${statObject.pdf}
  `);
  return statObject;
};
module.exports.search = (string, arg, logging=true) => {
  /**

  Searches the Elasticsearch instance

  String:
    'episodes': Searches by episode number
    'quotes': Searches by quotes

  Argument:
    int for episodes
    string for quotes

  **/
  if (logging) {
    logger = log4js.getLogger();
  } else {
    logger = log4js.getLogger('off');
  }
  return new Promise(function (resolve, reject) {
    (async () => {
      function reqBody(type) {
        let object;
        switch(type) {
          case 'episodes':
            if (typeof arg == 'string') {
              arg = parseInt(arg);
            }
            object = {
              index: searchIndex,
              body: {
                query: {
                  bool: {
                    must: [
                      { term: { number: arg } },
                      { term: { group: 'episode' } }
                    ],
                  }
                }
              }
            };
            return object;
            break;
          case 'quotes':
          if (typeof arg != 'string') {
            arg = arg.toString();
          }
            object = {
              index: searchIndex,
              body: {
                query: {
                  match: {
                    quote: arg
                  }
                }
              }
            };
            return object;
            break;
          default:
            reject('No search type selected')
        }
      }
      let { body } = await client.search(reqBody(string));
      resolve(body.hits.hits)

    })();
  })
};
module.exports.index = (indexObjects, logging=true) => {
  /**

    Takes in an array of objects ready to be consumed by
    Elasticsearch and indexs them one by one into our
    instance of AWS Elasticsearch

    TODO: Add some logging to this function

  **/
  if (logging) {
    logger = log4js.getLogger();
  } else {
    logger = log4js.getLogger('off');
  }
  return new Promise(function (resolve, reject) {
    (async () => {
      for (let indexObject of indexObjects) {
      await client.index(indexObject);
      if (indexObject.body.group == 'episode') {
      logger.info(`
Indexing: ${indexObject.body.group}:
ID: ${indexObject.id}
Episode: ${indexObject.body.episode}
Number: ${indexObject.body.number}
        `);
      } else {
      logger.info(`
Indexing: ${indexObject.body.group}:
ID: ${indexObject.id}
Episode: ${indexObject.body.episode}
Number: ${indexObject.body.number}
Speaker: ${indexObject.body.speaker}
Quote: ${indexObject.body.quote}
        `);
      }

    }
  })();
});
};
module.exports.map = (logging=true) => {
  /*

  Creates an indix and gives it thhe default
  episode/quote mapping

  */
  if (logging) {
    logger = log4js.getLogger();
  } else {
    logger = log4js.getLogger('off');
  }
  return new Promise(function (resolve, reject) {
    (async() => {
      await client.indices.create({
        index: searchIndex,
        body: {
          mappings: {
            properties: {
              group: {
                type: "keyword"
              },
              podcast: {
                type: "text"
              },
              episode: {
                type: "text"
              },
              number: {
                type: "integer"
              },
              url_scraped_from: {
                type: "text"
              },
              download_url: {
                type: "text"
              },
              speaker: {
                type: "text"
              },
              is_mcelroy: {
                type: "boolean"
              },
              quote: {
                type: "text"
              }
            }
          }
        }
      });
      let res = await client.indices.getMapping({
        index: searchIndex
      });
      console.log(res);
    })();
  });
};
module.exports.check = (logging=true) => {
  /*

  Verifies that mappings are in place

  */
  if (logging) {
    logger = log4js.getLogger();
  } else {
    logger = log4js.getLogger('off');
  }
  return new Promise(function (resolve, reject) {
    (async()=>{
      let res = await client.indices.getMapping({
        index: searchIndex
      });
      console.log(res.body[searchIndex].mappings.properties);
    })()
  })
};
