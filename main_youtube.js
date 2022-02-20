// const { requestAndUpdate, initializeData } = require('./api_request/api')
const { firestoreListener } = require('./firebase-firestore/firestore')
const { youtubeApiKeyList } = require('./api_keys')


let youtubeApiData = {
    requestInfo: {
        platform: 'youtube',
        filePath: __dirname + '../api_result/youtube.json',
        apiRoot: 'https://www.googleapis.com/youtube/v3/playlistItems?',
        timeOut: 2000,
        requestInterval: 90000
    }
}

firestoreListener('youtube', youtubeApiKeyList, youtubeApiData)

