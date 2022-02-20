// const { requestAndUpdate, initializeData } = require('./api_request/api')
const { firestoreListener } = require('./firebase-firestore/firestore')
const { snapshotApiKeyList } = require('./api_keys')

let snapshotApiData = {
    requestInfo: {
        platform: 'snapshot',
        filePath: __dirname + '/api_result/snapshot.json',
        apiRoot: 'https://hub.snapshot.org/graphql',
        timeOut: 2000,
        requestInterval: 600000
    }
}


firestoreListener('snapshot', snapshotApiKeyList, snapshotApiData)
