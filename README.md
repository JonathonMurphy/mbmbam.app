#  MBMBaM Quote Search Engine

![Alt text](./app/src/images/Screenshot.png?raw=true "MBMBaM Quote Search")

### H3 Setup

1. Clone repo
2. Download [Elasticsearch 7.2.0](https://www.elastic.co/downloads/elasticsearch)
3. Unzip Elasticsearch and place in the ./db directory
3. Run node ./db/index.js from the projects root directory
4. Run ./db/elasticsearch-7.2.0/bin/elasticsearch to start the Elasticsearch service
5. Run node ./app/server.js
6. Open your browser and navigate to http://localhost:60900/#search
