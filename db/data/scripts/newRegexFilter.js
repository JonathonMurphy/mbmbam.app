const gDocRegex = /\bPublished on\b|\bListen here on\b|/gi;

const nameRegex = /[A-Z]{1}[a-z]{1,6}\:|\b^Justin\b|\b^Travis\b|\b^Griffin\b|\bClint\b/g;

const theAlmightyRegex = /(?<speaker>(?<threeNames>[A-Z]{1}\w*\s{1}[A-Z]{1}\w*\s{1}[A-Z]{1}\w*\s*)|(?<twoNames>[A-Z]{1}\w*\s{1}\w*\s*)|(?<oneName>[A-Z]{1}\w*\s*))(?<lines>\:\s*.*\s*[^A-Z]*)/gm

replace(/\[.*\]/g. '');

// var myString = "something format_abc";
// var myRegexp = /(?:^|\s)format_(.*?)(?:\s|$)/g;
// var match = myRegexp.exec(myString);
// console.log(match[1]); // abc
