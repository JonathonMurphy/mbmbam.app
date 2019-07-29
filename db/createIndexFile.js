const fs = require('fs'),
      quotesFile = require('./data/quotes.json');

const mcelroyRegex = /(griffin|travis|justin|clint)/;

let index = [];

// Need to add a section to determine if the speaker is a McElroy, and a section for the episode download/listen to url

class IndexObejct {
  constructor(episode, speaker, quote, url_scraped_from, download_url) {
    this.index = 'mbmbam-search',
    this.type = 'quote',
    this.body = {}
    this.body.episode = episode,
    this.body.speaker = speaker,
    this.body.is_mcelroy = mcelroyRegex.test(speaker),
    this.body.quote = quote,
    this.body.url_scraped_from = url_scraped_from,
    this.body.download_url = download_url
  }
}

quotesFile.episodes.forEach(function(episode) {
  for (speaker in episode.quotes) {
    if (episode.quotes.hasOwnProperty(speaker)) {
      let speakerQuote = episode.quotes[speaker]
      speakerQuote.forEach(function(quote) {
        let newQuote = new IndexObejct (episode.episode, speaker, quote, episode.url, episode.download_url)
        index.push(newQuote)
      })
    }
  }
})

fs.writeFileSync('./data/index.json', JSON.stringify(index))
