// const { requestAndUpdate, initializeData } = require('./api_request/api')
const { firestoreListener } = require('./firebase-firestore/firestore')
const { twitterApiKeyList } = require('./api_keys')

let twitterApiData = {
    requestInfo: {
        platform: 'twitter',
        filePath: __dirname + '/api_result/twitter.json',
        apiRoot: [
            'https://api.twitter.com/2/users', 
            'https://api.twitter.com/2/tweets/counts/recent?query=from%3A'
        ],
        timeOut: 2000,
        requestInterval: 120000
    }
}


firestoreListener('twitter', twitterApiKeyList, twitterApiData)
