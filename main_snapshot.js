const { requestAndUpdate, initializeData } = require('./api_request/api')
const { snapshotApiKeyList } = require('./api_keys')

let snapshotApiData = {
    requestInfo: {
        platform: 'snapshot',
        filePath: __dirname + '/api_result/snapshot.json',
        apiRoot: 'https://hub.snapshot.org/graphql',
        timeOut: 2000,
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
        },
        {
            name: 'curve.eth',
            accountId: 'b52d8752-25b3-4400-9d7d-3a665c75f8d0'
        },
        {
            name: 'balancer.eth',
            accountId: '03423a44-eff2-4e48-a961-bde1ff9aa6aa'
        },
        {
            name: 'pancake',
            accountId: '5d27bab5-24f3-4867-9cbd-78166e5cad61'
        },
        {
            name: 'sushigov.eth',
            accountId: 'c745fd2b-8715-49df-a29b-961e1b3a34ae'
        },
        {
            name: 'ens.eth',
            accountId: 'c101ad93-6190-405d-85a9-75d259615647'
        },
    ]
}


const start = () => {
    try {
        initializeData(snapshotApiData)

        console.time('Timer')

        setInterval(() => {
            console.log('==== SNAPSHOT ====')
            console.timeLog('Timer')
            requestAndUpdate(snapshotApiData, snapshotApiKeyList)
        }, 600000)
    }
    catch (err) {
        console.log(err)
    }
}

start()