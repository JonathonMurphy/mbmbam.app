#!/usr/bin/env node
/*jshint esversion: 8 */
/*
  justin.js is the helper library
  for the backend portion of this app
/*
/* Dependencies */
const { Client } = require('@elastic/elasticsearch'),
      client = new Client({node: 'https://vpc-mbmbam-jb5nrxn3lk3epnc44z74hgccfu.us-east-2.es.amazonaws.com'}),
      hash = require('object-hash'),
      regex = require('./regex'),
      log4js = require('log4js'),
      path = require('path'),
      fs = require('fs');

/* Global Variables */
const logDir = path.resolve(__dirname, '../logs/data/');

/* Logging configuration */
// TODO: Add in an appender that will
// send out an email to us if certain conditions are met
const todaysDate = new Date();
const today = `${todaysDate.getFullYear()}.${todaysDate.getMonth()+1}.${todaysDate.getDate()}`;
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
    default: { appenders: ['travis', 'console'], level: 'info' },
    console: { appenders: ['console'], level: 'info'  },
    off: { appenders: ['console'], level: 'off'  }
  }
});
let logger;

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
module.exports.Episode = Episode;
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
module.exports.createIndex = (type, episodes) => {
  /**

    This function takes the finished array of episodes
    and returns an new array of objects that are ready
    to be indexed into Elasticsearch.

  **/
  let index = [];
  switch (type) {
    case 'quote':
      class IndexObject {
        constructor(episode, speaker, quote) {
          this.index = 'mbmbam-search',
          this.type = 'quote',
          this.body = {},
            this.body.id = null;
            this.body.podcast = episode.podcast,
            this.body.episode = episode.title,
            this.body.number = episode.number,
            this.body.speaker = speaker,
            this.body.is_mcelroy = regex.mcelroy.test(speaker),
            this.body.quote = quote,
            this.body.url_scraped_from = episode.transcript_url,
            this.body.download_url = episode.download_url;
              }
            }
            episodes.forEach(function(episode) {
              Object.keys(episode.quotes).forEach(function (speaker) {
                let quotes = episode.quotes[speaker];
                quotes.forEach(function(quote) {
                  let newQuote = new IndexObject (episode, speaker, quote);
                  index.push(newQuote);
                });
              });
            });
        return index;
      break;
    default:
      return index;
  }
};
module.exports.index = (indexObjects) => {
  /**

    Takes in an array of objects ready to be consumed by
    Elasticsearch and indexs them one by one into our
    instance of AWS Elasticsearch

  **/
  return new Promise(function (resolve, reject) {
    (async () => {
      for (let indexObject of indexObjects) {
      await client.index(indexObject);
    }
  })();
});
};
module.exports.search = (arg) => {
  (async () => {
    const { body } = await client.search({
      index: 'mbmbam-search',
      type: 'quote',
      body: {
        query: {
          match: {
            quote: arg
          }
        }
      }
    });

    body.hits.hits.forEach(function(hit) {
      console.log(hit);
      console.log("\n");
    });
  })();
};
module.exports.cleanup = (directory, daysToKeep=5, logging=true) => {
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
    filenameArray = filename.split(".");
    const fileDate = new Date(`${filenameArray[0]}/${filenameArray[1]}/${filenameArray[2]}`);
    const diffTime = Math.abs(todaysDate - fileDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > daysToKeep) {
      logger.info(`Removing ${directory}${filename}`);
      fs.unlinkSync(`${directory}${filename}`);
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
    })
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
module.exports.giveID = (indexObjects) => {
/*

  Takes a hash of an indexes episode number,
  speaker, and quote, and assigned it as the id
  for that index.

*/
  for (let indexObject of indexObjects) {
    indexObject.body.id = hash([
      indexObject.body.number,
      indexObject.body.speaker,
      indexObject.body.quote
    ]);
  }
}
