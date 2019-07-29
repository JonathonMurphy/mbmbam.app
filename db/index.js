const fs = require('fs');
const { Client } = require('@elastic/elasticsearch');
const client = new Client({ node: 'http://localhost:9200' });

const indexFiles = JSON.parse(fs.readFileSync('./data/index.json'))

async function run() {
  for (indexFile of indexFiles) {
    await client.index(indexFile)
  }
}

run().catch(console.log)
