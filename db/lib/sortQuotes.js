#!/usr/bin/env node
module.exports = (text, object) => {
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
