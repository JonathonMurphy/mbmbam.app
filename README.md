#  MBMBaM.app A Search Engine for McElroy Family Quotes

![Alt text](./app/src/images/Screenshot.png?raw=true "MBMBaM Quote Search")

### API Documentation

The API behind the site is publicly accessible. The endpoints follow the structure shown below:

* https://mbmbam.app/api/search/:speaker/:query

#### :speaker

:speaker has a few default accepted values, but will take any value that you place in it. Outside of the defaults you can put in any other string value you will like and it will return quotes from that speaker.

##### Default accepted values for :speaker
* all
  * Searches for quotes frohttps://github.com/JonathonMurphy/mbmbam.appm all speakers
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


### Return Object
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
