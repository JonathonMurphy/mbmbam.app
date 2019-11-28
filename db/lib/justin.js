#!/usr/bin/env node
const puppeteer = require('puppeteer'),
      cheerio = require('cheerio'),
      path = require('path'),
      fs = require('fs');

// Various regular expersions
module.exports.regex = {
  episodeTitle: /MBMBAM\s{1}\d{2,}\:.*/mi,
  gDoc: /\bPublished on\b|\bListen here on\b|/gi, // could maybe be merged with 'filter'
  quote: /(?<speaker>(?<threeNames>[A-Z]{1}[a-zA-Z]*\s{1}[A-Z]{1}[a-zA-Z]*\s{1}[A-Z]{1}[a-zA-Z]*\s*)|(?<twoNames>[A-Z]{1}[a-zA-Z]*\s{1}[a-zA-Z]*\s*)|(?<oneName>[A-Z]{1}[a-zA-Z]*\s*))(?<lines>\:\s*.*\s*[^A-Z]*)/gm,
  filter: /\byahoo\b|\bsponsored\b|\bmbmbam\// BUG: |\bhousekeeping\b|\boriginally released\b|\bepisode\b|\bSuggested talking points\b|\bintro\b|\bMy Brother My Brother and Me\b|\b.*,.*,.*,.*\b/gi,
  newlines:  /\r?\n|\r/g,
  timeStamp: /[0-9]{1,2}:+[0-9]{2}/gm,
}

//  Taken from refreshGDocLinks.js
module.exports.getGDocLinks = async () => {
  try {
    // Fires up puppeteer in headless mode, and loads up the page.
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    await page.setViewport({
        width: 1200,
        height: 10000
    });
    await page.goto('https://docs.google.com/document/d/1x7pn2XZp6UxVUD9oOkuweInUKa66KrcmvGt-ISNxJLE/edit');
    // Assins all the HTML content of the page to a variable and then give cheerio access to it.
    let html = await page.content();
    const $ = cheerio.load(html);
    // Sets up that array for later use.
    let linkArray = {
      urls: []
    };
    // Gets all the links on the page
    let links = $('#kix-appview').find('a.kix-link');
    // Loops through all the links, pulls the URL out and adds it to the linkArray.
    links.each(function (i, elem) {
      if ($(this).attr('href').includes('/edit') !== true) {
        linkArray.urls.push($(this).attr('href'));
      }
    });
    return linkArray;
    await browser.close();
  } catch (error) {
    console.log(error);
  }
}

// Taken from sortQuotes.js
module.exports.sortQuote = (text, object) => {
  const speakerRegex = /^[A-Z]{1}[a-zA-Z]*(\s{1}[a-zA-Z]*\:|\:)/;
  const quoteRegex = /[^(\w\:)].*/;
  speakerName = text.match(speakerRegex);
  if (speakerName != null) {
    speakerName = speakerName[0].replace(/\:/, '');
    speakerName = speakerName.toLowerCase();
    quoteText = text.match(quoteRegex);
    quoteText = quoteText[0].trim();
    if (object.quotes.hasOwnProperty(speakerName)) {
      object.quotes[speakerName].push(quoteText)
    } else {
      object.quotes[speakerName] = [quoteText];
    }
  }

}

// takes from quoteObject.json
module.exports.quoteObject = {
  url: "",
  download: "",
  episode: "",
  quotes: {}
}
