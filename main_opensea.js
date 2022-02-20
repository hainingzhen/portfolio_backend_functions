// const { requestAndUpdate, initializeData } = require('./api_request/api')
const { firestoreListener } = require('./funcs/all')
const { openseaApiKeyList } = require('./api_keys')

let openseaApiData = {
    requestInfo: {
        platform: 'opensea',
        filePath: __dirname + '/api_result/opensea.json',
        apiRoot: 'https://api.opensea.io/api/v1/collection/',
        timeOut: 12000,
        requestInterval: 900000
    }
}


firestoreListener('opensea', openseaApiKeyList, openseaApiData)
