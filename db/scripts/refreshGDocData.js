#!/usr/bin/env node

console.log('Is this thing on...');

const puppeteer = require('puppeteer'),
      cheerio = require('cheerio'),
      _cliProgress = require('cli-progress'),
      path = require('path'),
      fs = require('fs');

const sortQuotesPath = path.resolve(__dirname, '../../lib/sortQuotes.js'),
      gDocLinksPath = path.resolve(__dirname, '../links/gDocLinks.json'),
      gDocQuotesPath = path.resolve(__dirname, '../quotes/gDocQuotes.json');

const sortQuotes = require(sortQuotesPath);

// Start progress bar
const bar1 = new _cliProgress.Bar({}, _cliProgress.Presets.shades_classic);
bar1.start(99, 0);




// Gets array of links from JSON document
let gDocLinks;
  try {
    gDocLinks = JSON.parse(fs.readFileSync(gDocLinksPath));
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.log('File not found!');
    } else {
      throw err;
    }
  }

// Sets arracy variable
const urlArray = gDocLinks.urls;

// Setup data structure
let mbmbamQuotes = new Object();
mbmbamQuotes.episodes = [];

// Regex filters
const regexEpisodeTitle = /MBMBAM\s{1}\d{2,}\:.*/mi;
const quoteRegex = /(?<speaker>(?<threeNames>[A-Z]{1}[a-zA-Z]*\s{1}[A-Z]{1}[a-zA-Z]*\s{1}[A-Z]{1}[a-zA-Z]*\s*)|(?<twoNames>[A-Z]{1}[a-zA-Z]*\s{1}[a-zA-Z]*\s*)|(?<oneName>[A-Z]{1}[a-zA-Z]*\s*))(?<lines>\:\s*.*\s*[^A-Z]*)/gm;

  (async () => {
    try {
      // Fires up puppeteer in headless mode
      const browser = await puppeteer.launch({headless: true});
      // Update progress bar
      bar1.increment();
      // Loop over all the array items
      for (i=0; i<urlArray.length; i++) {
        // Log the progress to CLI
        bar1.increment();
        // Setup data structure
        let quoteObject = {
          url: urlArray[i],
          episode: '',
          quotes: {}
        };
        // Open new page and load current url from the arracy in puppeteer
        const page = await browser.newPage();
        await page.setViewport({
            width: 1200,
            height: 10000
        });
        await page.goto(urlArray[i]);
        // Assins all the HTML content of the page to a variable and then give cheerio access to it.
        let html = await page.content();
        const $ = cheerio.load(html);
        // let m;
        // let pageText = $('#contents').innerText()
        // grab all the text contents with innerText() and then use regex to navigate it
        // $('#contents').children('p').each(function (i, elem) {
        //   let text = $(this).text();
        //   if ((m = regexEpisodeTitle.test(text)) == true) {
        //     quoteObject.episode = text.replace('MBMBAM', 'Episode');
        //   } else {
        //     // Filters by brother
        //     sortQuotes(text, quoteObject);
        //   }
        // });
        /**/
        let str;
        $('span').each(function(i, elem){
          str += $(this).text() + '\n'
        })
        let regexMatches = {
          matches: []
        }
        episodeTitle = str.match(regexEpisodeTitle);
        if (episodeTitle != null) {
          quoteObject.episode = episodeTitle[0].replace(/MBMBAM/i, 'Episode');
        } else {
          quoteObject.episode = "n/a"
        }
        regexMatches.matches = str.match(quoteRegex)
        regexMatches.matches.map(function(entry, index, array){
          array[index] = entry.replace(/\r?\n|\r/g, '')
        })
        regexMatches.matches.forEach(function(match) {
          sortQuotes(match, quoteObject)
        })
        /**/
        // Push new episode object in to the array
        mbmbamQuotes.episodes.push(quoteObject);

        //  Close current page
        await page.close();
      } // End for loop
      fs.writeFileSync(gDocQuotesPath, JSON.stringify(mbmbamQuotes), function(err) {
        if(err) console.log(err)
      })
      await browser.close();
      bar1.stop();
    } catch (error) {
      console.log(error);
    }
  })()
