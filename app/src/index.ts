// Import CSS Modules
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import '../node_modules/font-awesome/css/font-awesome.css';
import './css/style.css'
import 'bootstrap';
// Import Template file
import * as templates from './templates.ts';
// Import image file
import './images/mbmbamLogo.png';

document.body.innerHTML = templates.main();
const logoElement = document.body.querySelector('#logo');
const searchElement = document.body.querySelector('#search');
const resultsElement = document.body.querySelector('#results');
const footer = document.body.querySelector('footer');

const getQuotes = async (endpoint, query) => {
  const esRes = await fetch(`/api/search/${endpoint}/${query}`);

  const esResBody = await esRes.json();
  console.log(esResBody);
  return esResBody.map(hit => ({
    episode: hit.episode,
    speaker: hit.speaker,
    quote: hit.quote,
    download_url: hit.download_url
  }));
};

const getRandomQuotes = async () => {
  const esRes = await fetch(`/api/search/random`);

  const esResBody = await esRes.json();
  console.log(esResBody);
  return esResBody.map(hit => ({
    episode: hit.episode,
    speaker: hit.speaker,
    quote: hit.quote,
    download_url: hit.download_url
  }));
};

const listQuotes = quotes => {
  resultsElement.innerHTML = templates.listQuotes({quotes})
};

const loadResults = async (event) => {
  event.preventDefault();
  // Get the contenst of the filter by drop down
  const endpointElement = (<HTMLSelectElement>document.querySelector('#endpoint'));
  let endpoint = endpointElement.options[endpointElement.selectedIndex].value;
  // Get the contents of the search bar
  const queryElement = (<HTMLInputElement>document.querySelector('#query'));
  let query = queryElement.value;
  if (query.length > 0) {
    console.log(`${endpoint}: ${query}`);
    resultsElement.innerHTML = templates.loading();
    const quotes = await getQuotes(endpoint, query);
    listQuotes(quotes);
  }
}

document.addEventListener('DOMContentLoaded', load => {
  const searchButton = (<HTMLElement>document.body.querySelector('#search-button'));
  const randomButton = (<HTMLElement>document.body.querySelector('#random-button'));
  const searchBar = (<HTMLElement>document.body.querySelector('#query'));
  const filterSelection = (<HTMLSelectElement>document.querySelector('#endpoint'));
  filterSelection.addEventListener('change', loadResults)
  searchButton.addEventListener('click', loadResults);
  randomButton.addEventListener('click', async event => {
    const quotes = await getRandomQuotes();
    listQuotes(quotes);
  })
  searchBar.addEventListener('keypress', event => {
    if (event.key === 'Enter') {
      loadResults(event);
    }
  });
});

/*
  * Use Window location has to show the specified view
*/
const showView = async () => {
  const [view, ...params] = window.location.hash.split('/');

  switch (view) {
    case '':
      logoElement.innerHTML = templates.logo();
      searchElement.innerHTML = templates.searchBar();
      resultsElement.innerHTML = templates.tagLine();
      // footer.innerHTML = templates.footerBar();
      break;
    default:
      // Unrecognized view
      throw Error(`Unrecognized view: ${view}`);
  }
};

window.addEventListener('hashchange', showView)
showView().catch(err => window.location.hash = ``)
