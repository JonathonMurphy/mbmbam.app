/*
  * Provides API endpoints for searching the quotes index
*/
'use strict';
const request = require('request'),
      rp = require('request-promise');


module.exports = (app, es) => {
  const url = `https://${es.host}/${es.index}/_search`;
  const responseSize = 15;
  /* All endpoint
    * Search for quotes by matching a particular query
  */
  app.get('/api/search/all/:query', (req, res) => {
    const esReqBody = {
      size: responseSize,
      query: {
        match: {
          quote: req.params.query,
        }
      }
    };
    rp({url, json: true, body: esReqBody})
      .then(esResBody => res.status(200).json(esResBody.hits.hits.map(({_source}) => _source)))
      .catch(({error}) => res.status(error.status || 502).json(error));
  });

  /* McElroy endpoint
    * Search for quotes by matching a particular query, filtered by the is_mcelroy field
  */
  app.get('/api/search/mcelroy/:query', (req, res) => {
    const esReqBody = {
      size: responseSize,
      query: {
        bool: {
          must: {
            term: { is_mcelroy: true }
          },
          should: {
            term: { quote: req.params.query}
          }
        }
      }
    };
    rp({url, json: true, body: esReqBody})
      .then(esResBody => res.status(200).json(esResBody.hits.hits.map(({_source}) => _source)))
      .catch(({error}) => res.status(error.status || 502).json(error));
  });

  /* Audience endpoint
    * Search for quotes by matching a particular query, filtered by the is_mcelroy field
  */
  app.get('/api/search/audience/:query', (req, res) => {
    const esReqBody = {
      size: responseSize,
      query: {
        bool: {
          must: {
            term: { is_mcelroy: false }
          },
          should: {
            term: { quote: req.params.query}
          }
        }
      }
    };
    rp({url, json: true, body: esReqBody})
      .then(esResBody => res.status(200).json(esResBody.hits.hits.map(({_source}) => _source)))
      .catch(({error}) => res.status(error.status || 502).json(error));
  });

  /* Speaker endpoint
    * Search for quotes from a specific speaker
  */
  app.get('/api/search/:speaker/:query', (req, res) => {
    const esReqBody = {
      size: responseSize,
      query: {
        bool: {
          must: {
            term: { speaker: req.params.speaker }
          },
          should: {
            term: { quote: req.params.query}
          }
        }
      }
    };
    rp({url, json: true, body: esReqBody})
      .then(esResBody => res.status(200).json(esResBody.hits.hits.map(({_source}) => _source)))
      .catch(({error}) => res.status(error.status || 502).json(error));
  });

  /* Random endpoint
    * Randomly Pull a document from the index
  */
  app.get('/api/search/random', (req, res) => {
    const esReqBody = {
       size: responseSize,
       query: {
          function_score: {
             functions: [
                {
                   random_score: {
                      seed: new Date()
                   }
                }
             ]
          }
       }
    }
    rp({url, json: true, body: esReqBody})
      .then(esResBody => res.status(200).json(esResBody.hits.hits.map(({_source}) => _source)))
      .catch(({error}) => res.status(error.status || 502).json(error));
  });


  // Need to implement a private endpoint for twitter replies
  app.get('/api/get/reply', (req, res) => {
    const esReqBody = {
       size: 1,
       query: {}
    }
    rp({url, json: true, body: esReqBody})
      .then(esResBody => res.status(200).json(esResBody.hits.hits.map(({_source}) => _source)))
      .catch(({error}) => res.status(error.status || 502).json(error));
  });

}
