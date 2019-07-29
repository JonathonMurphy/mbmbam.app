import * as Handlebars from '../node_modules/handlebars/dist/handlebars.js';

export const main = Handlebars.compile(`
<div class='container'>
  <div id="logo"></div>
  <div id="search"></div>
  <div id="results"></div>
</div>
<footer></footer>
`);

export const logo = Handlebars.compile(`
  <div class="col-md-6 offset-md-3">
    <img id="mbmbam-logo" src="./images/mbmbamLogo.png" alt="My Brother, My Brother and Me Logo"/>
  </div>
`);

export const searchBar = Handlebars.compile(`
  <div class="container">
  	<div class="row">
  		<div class="col-md-12">
              <div class="input-group" id="adv-search">
                  <input id="query" type="text" class="form-control"autocapitalize="off" placeholder="What's up you cool baby..." aria-label="Search Box"/>
                  <div class="input-group-btn">
                      <div class="btn-group" role="group">
                          <div class="dropdown dropdown-lg">
                              <button type="button" class="btn btn-secondary dropdown-toggle" data-toggle="dropdown" aria-expanded="false" aria-label="Dropdown Button for Filtering"><span class="caret"></span></button>
                              <div class="dropdown-menu dropdown-menu-right" role="menu">
                                  <form role="form">
                                    <div class="form-group">
                                      <label for="filter">Filter by</label>
                                      <select id="endpoint" class="form-control">
                                          <option value="all" selected>All Quotes</option>
                                          <option value="mcelroy">McElroys</option>
                                          <option value="audience">Audience</option>
                                          <option value="justin">Justin</option>
                                          <option value="travis">Travis</option>
                                          <option value="griffin">Griffin</option>
                                          <option value="clint">Clint</option>
                                      </select>
                                    </div>
                                  </form>
                              </div>
                          </div>
                          <button type="button" id="search-button" class="btn btn-primary" aria-label="Search Button"><span class="fa fa-search" aria-hidden="true"></span></button>
                      </div>
                  </div>
              </div>
            </div>
          </div>
  	</div>
  </div>
`);

// Needs to work better on mobile.
export const loading = Handlebars.compile(`
  <div class="panel panel-default">
    <div class="panel-heading">Results</div>
      <div id="loading" class="container">
        <div class="col-md-6 offset-md-6">
          <div class="spinner-border text-secondary" role="status">
            <span class="sr-only">Loading...</span>
          </div>
        </div>
      </div>
    </div>
  </div>
`);

export const listQuotes = Handlebars.compile(`
  <div class="panel panel-default">
    <div class="panel-heading">Results</div>
    {{#if quotes.length}}
      {{#each quotes}}
      <div class="container">
        <div class="card">
          <div class="card-body">
            <p class="card-text">{{quote}}</p>
            <p class="card-title text-capitalize">- {{speaker}}</p>
            <p class="card-subtitle mb-2 text-muted">{{episode}}</p>
            <a href="{{download_url}}" target="_blank" class="btn btn-primary">Download Episode</a>
          </div>
        </div>
      </div>
      {{/each}}
    {{else}}
    <div class="container">
      <div class="card">
        <div class="card-body">
          <p class="card-text">Yeah sorry, bud. I don't know what you're talking about.</p>
        </div>
      </div>
    </div>
    {{/if}}
  </div>
`);

export const tagLine = Handlebars.compile(`
  <div class="panel panel-default">
    <div class="h5 text-muted text-center panel-heading">The search engine for finding your favorite goofs by the McElroy brothers.<div>
  </div>
`);

export const footerBar = Handlebars.compile(`
  <div class="container">
  <hr>
    <div class="row">
      <div class="col-md-3 text-center">
        <a href="jsmurphy.info" target="_blank">Contribute</a>
      </div>
      <div class="col-md-3 text-center">
        <a href="https://mbmbam.fandom.com/wiki/My_Brother,_My_Brother_and_Me_Wiki" target="_blank">Wikia</a>
      </div>
      <div class="col-md-3 text-center">
        <a href="https://docs.google.com/document/d/1x7pn2XZp6UxVUD9oOkuweInUKa66KrcmvGt-ISNxJLE/edit" target="_blank">Fanscripts</a>
      </div>
      <div class="col-md-3 text-center">
        <a href="https://twitter.com/Mbmbam_Quotes" target="_blank">Twitter</a>
      </div>
    </div>
  </div>
`);
