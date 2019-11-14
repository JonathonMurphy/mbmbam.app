const cheerio = require('cheerio');
const fs = require('fs');
const webPage = fs.readFileSync('../pages/episode364.htm')
const $ = cheerio.load(webPage)
const sortQuotes = require('../../lib/sortQuotes.js')

const regexEpisodeTitle = /MBMBAM \d{2,}\:/gmi;
const quoteRegex = /(?<speaker>(?<threeNames>[A-Z]{1}[a-zA-Z]*\s{1}[A-Z]{1}[a-zA-Z]*\s{1}[A-Z]{1}[a-zA-Z]*\s*)|(?<twoNames>[A-Z]{1}[a-zA-Z]*\s{1}[a-zA-Z]*\s*)|(?<oneName>[A-Z]{1}[a-zA-Z]*\s*))(?<lines>\:\s*.*\s*[^A-Z]*)/gm;
let str;
$('span').each(function(i, elem){
  str += $(this).text() + '\n'
})
let regexMatches = {
  matches: []
}
regexMatches.matches = str.match(quoteRegex)
regexMatches.matches.map(function(entry, index, array){
  array[index] = entry.replace(/\r?\n|\r/g, '')
})
let quoteObject = {
  url: '',
  episode: '',
  quotes: {}
}
regexMatches.matches.forEach(function(match) {
  sortQuotes(match, quoteObject)
})

fs.writeFileSync('./test364.txt', str)
fs.writeFileSync('./testOutput364.json', JSON.stringify(quoteObject))
