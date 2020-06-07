#  MBMBaM.app A Search Engine for McElroy Family Quotes

![Alt text](./app/src/images/Screenshot.png?raw=true "MBMBaM Quote Search")

### API Documentation

The API behind the site is publicly accessible. The endpoints follow the structure shown below:

* https://mbmbam.app/api/search/:speaker/:query

#### :speaker

:speaker has a few default accepted values, but will take any value that you place in it. Outside of the defaults you can put in any other string value you will like and it will return quotes from that speaker.

##### Default accepted values for :speaker
* all
  * Searches for quotes from all speakers
* mcelroy
  * Searches for quotes from any of the McElroy's
* audience
  * Searches for quotes from any non-McElroy

#### :query  

:query accepts any url encoded string, and will return quotes matching that string spoken by the given :speaker

For example: /api/search/travis/hot%20sauce
Returns quotes from Travis where the words 'hot sauce' show up

#### random

Hitting /api/search/random returns 15 random quotes from the database

### Example
```
curl https://mbmbam.app/api/search/justin/ducktales | jq
```

#### Returns
```
[
  {
    "group": "quote",
    "podcast": null,
    "episode": "364:‌ ‌Face‌ ‌2‌ ‌Face:‌ ‌Dumbledore’s‌ ‌Magic‌ ‌Buffalo‌ ‌Wings‌",
    "number": 364,
    "url_scraped_from": "https://docs.google.com/document/d/e/2PACX-1vQ_7Fol7wwQb0AbbVarck6cv7dsjTX7usaZC7a6LD-5tnhBVkBfWNZ-D7pZ5NYrgvY5wv0r7j27s3EW/pub",
    "download_url": "https://mbmbam.simplecast.com/episodes/mbmbam-364-face-2-face-dumbledores-magic-buffalo-wings-CADoVZY_",
    "speaker": "justin",
    "is_mcelroy": true,
    "quote": "Oh, DuckTales too, that’s choice."
  },...

```


#### Return Object Structure
```
{
  0: {
    episode: string,
    speaker: string,
    is_mcelroy: boolean,
    quote: string,
    url_scraped_from: string,
    download_url: string
  },
  ...
  14: {...}
}
```
