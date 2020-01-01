#!/usr/bin/env node
console.log("We bout to get some data ya'll" + "\n");
// Maybe pull this out into two scripts so that it can be handled similarly to the gDocs
// One script to get links and store the
// Another to pull the data from the links

const Wikiaapi = require('nodewikiaapi'),
      wiki = 'http://mbmbam.wikia.com',
      rp = require('request-promise'),
      mywiki = new Wikiaapi('mbmbam'),
      queryString = require('query-string'),
      cheerio = require('cheerio'),
      path = require('path'),
      // _cliProgress = require('cli-progress'),
      // bar1 = new _cliProgress.Bar({}, _cliProgress.Presets.shades_classic),
      fs = require('fs');

const sortQuotesPath = path.resolve(__dirname, '../../lib/sortQuotes.js'),
      wikiaQuotesPath = path.resolve(__dirname, '../quotes/wikiaQuotes.json');


const sortQuotes = require(sortQuotesPath);

// bar1.start(16791, 0);

function getEpisodes() {
  mywiki.getArticlesList({
      limit: 1000
  }).then(function (data) {
    let episodeArray = [];
    data.items.forEach(function (item, i) {
      // bar1.increment();
      if (data.items[i].url.includes('Episode_') && !data.items[i].url.hasOwnProperty('undefined') ) {
        episodeArray.push(data.items[i].url);
      }
    })
    getQuotes(episodeArray)
  }).catch(function (error) {
    console.error(error);
  })
} // End of getEpisodes function

function getQuotes (episodeURL) {
  let mbmbamQuotes = new Object();
  // Start of new data structure
  mbmbamQuotes.episodes = [];
  episodeURL.forEach(function (episode, index, array){
    // bar1.increment();
    let quoteObject = {
      url: wiki + episodeURL[index],
      // This obtusely long value is taking the URLs ending, removing the '/wiki/' part
      // decoding with queryString.parse then  getting the key of the resulting object
      // removing it from an array, and then finally removing the '_' characters and
      // replacing them with spaces
      episode: Object.keys(queryString.parse(episodeURL[index].substr(6)))[0].replace(/_/g, ' '),
      quotes: {
        justin: [],
        travis: [],
        griffin: [],
        unattributed: []
      }
    };
    const options = {
      uri: 'http://mbmbam.wikia.com' + episodeURL[index],
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
            text.replace('subStringSelection', '')
            return text;
          }
          if ((m = regexFilter.test(text)) == false) {
            // Filters quotes by brother
            sortQuotes(text, quoteObject);
          }
        }) // End of Filter Selection Section

        mbmbamQuotes.episodes.push(quoteObject);

      }).then(function(){
        fs.writeFileSync(wikiaQuotesPath, JSON.stringify(mbmbamQuotes), function(err) {
          if(err) console.log(err)
        })
      })
      .catch(function (err) {
        console.error(err);
      })
  })

}

getEpisodes();
