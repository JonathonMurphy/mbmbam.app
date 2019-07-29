const fs = require('fs'),
      cheerio =  require('cheerio'),
      rp = require('request-promise');

const quotesFile = JSON.parse(fs.readFileSync(`${__dirname}/data/quotes.json`));

const mcelroyRegex = /(griffin|travis|justin|clint)/,
      epNumRegex = /\d{2,}/;

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
    })
  }
}

regexConstructor = (match) => {
  const negativeLookBehind = '(?<![0-9])',
        negativeLookAhead = '(?![0-9])';
  if (match < 10) {
    let findEpisodeUrlRegex = `${negativeLookBehind}0${match.toString()}${negativeLookAhead}`
    return new RegExp(findEpisodeUrlRegex);
  } else {
    let findEpisodeUrlRegex = `${negativeLookBehind}${match.toString()}${negativeLookAhead}`
    return new RegExp(findEpisodeUrlRegex);
  }
}

rp(options)
  .then(($) => {
    let links = [];
    $('link').each(function() {
      links.push($(this).text())
    })
    quotesFile.episodes.forEach(function(episode) {
      let eisodeNumber;
      if (episode.episode.match(epNumRegex) != null) {
        episodeNumber = Number(episode.episode.match(epNumRegex)[0]);
      } else {
        episodeNumber = 'n/a';
      }
      let findUrlRegex = regexConstructor(episodeNumber);
      links.forEach(function(link) {
        if (link.match(findUrlRegex) != null) {
          episode.download_url = link
        }
      })
    })
  })
  .then(function() {
    fs.writeFileSync(`${__dirname}/data/quotes.json`, JSON.stringify(quotesFile), function(err) {
      if(err) console.log(err)
    })
  })
  .catch((err) => console.error(err))
