const fs = require('fs');
const { Client } = require('@elastic/elasticsearch');
const client = new Client({node: 'https://vpc-mbmbam-jb5nrxn3lk3epnc44z74hgccfu.us-east-2.es.amazonaws.com'});

const indexFiles = JSON.parse(fs.readFileSync('./data/index.json'))

async function run() {
  for (indexFile of indexFiles) {
    await client.index(indexFile)
  }
}

run().catch(console.log)
