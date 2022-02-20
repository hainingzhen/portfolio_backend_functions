const { requestAndUpdate, initializeData } = require('./api_request/api')
const { mediumApiKeyList } = require('./api_keys')


let mediumApiData = {
    requestInfo: {
        platform: 'medium',
        filePath: __dirname + '/api_result/medium.json',
        apiRoot: 'https://medium.com/feed/@',
        timeOut: 2000,
    }
}

