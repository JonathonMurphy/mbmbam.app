#!/usr/bin/env node
const puppeteer = require('puppeteer'),
      cheerio = require('cheerio'),
      path = require('path'),
      fs = require('fs');

const gDocLinksPath = path.resolve(__dirname, '../links/gDocLinks.json');

// Generate array of URL's from the Complpeted MBMBAM Transcripts G Doc list.
(async () => {
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

    // linkArray.urls.slice(2);
    fs.writeFileSync(gDocLinksPath, JSON.stringify(linkArray), function(err) {
      if(err) console.log(err)
    })
    await browser.close();
  } catch (error) {
    console.log(error);
  }
})()
