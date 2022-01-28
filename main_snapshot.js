const { requestAndUpdate, initializeData } = require('./api_request/api')
const { snapshotApiKeyList } = require('./api_keys')

const snapshotApiData = {
    requestInfo: {
        platform: 'snapshot',
        filePath: __dirname + '/api_result/snapshot.json',
        apiRoot: 'https://hub.snapshot.org/graphql',
        timeOut: 500,
    },
    list: [
        {
            name: 'ilvgov.eth',
            accountId: '6fc27995-f051-4d0e-9890-0ed9508bceaa'
        },
        {
            name: 'aave.eth',
            accountId: '75b062d6-c4bd-449c-8055-dcfb71e7e2fc'
        },
        {
            name: 'uniswap',
            accountId: '23e42764-972e-4000-9f0b-5869cba9ecd4'
        }
    ]
}


const start = async () => {
    try {
        await initializeData(snapshotApiData)

        console.time('Timer')

        setInterval(() => {
            console.log('==== SNAPSHOT REQ ====')
            console.timeLog('Timer')
            requestAndUpdate(snapshotApiData, snapshotApiKeyList)
        }, 600000)
    }
    catch (err) {
        console.log(err)
        console.timeEnd('Timer')
    }
}

// start()