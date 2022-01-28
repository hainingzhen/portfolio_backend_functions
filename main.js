const { requestAndUpdate, initializeData } = require('./api_request/api')
const { 
    youtubeApiKeyList, 
    twitterApiKeyList, 
    mediumApiKeyList, 
    snapshotApiKeyList,
    openseaApiKeyList
} = require('./api_keys')


const youtubeAccountList = {
    platform: 'youtube',
    filePath: __dirname + '/api_result/youtube.json',
    apiRoot: 'https://www.googleapis.com/youtube/v3/playlistItems?',
    timeout: 333,
    list: [
        {
            name: 'freeCodeCamp',
            accountId: 'UC8butISFwT-Wl7EV0hUK0BQ',
            uploadListId: 'UU8butISFwT-Wl7EV0hUK0BQ'
        },
        {
            name: 'Novara Media',
            accountId: 'UCOzMAa6IhV6uwYQATYG_2kg',
            uploadListId: 'UUOzMAa6IhV6uwYQATYG_2kg'
        },
        {
            name: 'Coin Bureau',
            accountId: 'UCqK_GSMbpiV8spgD3ZGloSw',
            uploadListId: 'UUqK_GSMbpiV8spgD3ZGloSw'
        },
    ]
}

const twitterAccountList = {
    platform: 'twitter',
    filePath: __dirname + '/api_result/twitter.json',
    apiRoot: 'https://api.twitter.com/2/users',
    timeout: 333,
    list: [
        {
            name: 'MichelleObama',
            accountId: '409486555'
        },
        {
            name: 'BarackObama',
            accountId: '813286'
        },
        {
            name: 'TEDTalks',
            accountId: '15492359'
        }
    ]
}

const mediumAccountList = {
    platform: 'medium',
    filePath: __dirname + '/api_result/medium.json',
    apiRoot: 'https://medium.com/feed/@',
    timeout: 500,
    list: [
        {
            name: 'barackobama',
            accountId: '463320'
        },
        {
            name: 'michael-thompson',
            accountId: '335579811840000'
        },
        {
            name: 'zulie',
            accountId: '294840'
        }
    ]
}

const snapshotAccountList = {
    platform: 'snapshot',
    filePath: __dirname + '/api_result/snapshot.json',
    apiRoot: 'https://hub.snapshot.org/graphql',
    timeout: 500,
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

const openseaAccountList = {
    platform: 'opensea',
    filePath: __dirname + '/api_result/opensea.json',
    apiRoot: 'https://api.opensea.io/api/v1/collection/',
    timeout: 10000,
    list: [
        {
            name: 'boredapeyachtclub',
            accountId: 'eeca092c-944a-4a5d-92f3-6b518c821787'
        },
        {
            name: 'shootingfromthehip',
            accountId: '4c69563b-7b42-4276-b82d-334799fe24cf'
        },
        {
            name: 'mxse',
            accountId: '1c71fa64-dc65-4d42-8547-ccfa46e0996e'
        }
    ]
}


const start = async () => {
    try {
        await initializeData(youtubeAccountList)
        await initializeData(twitterAccountList)
        await initializeData(mediumAccountList)
        await initializeData(snapshotAccountList)
        await initializeData(openseaAccountList)

        console.time('Timer')

        setInterval(() => {
            console.log('==== YOUTUBE REQ ====')
            console.timeLog('Timer')
            requestAndUpdate(youtubeAccountList, youtubeApiKeyList)
        }, 84000)

        setInterval(() => {
            console.log('==== TWITTER REQ ====')
            console.timeLog('Timer')
            requestAndUpdate(twitterAccountList, twitterApiKeyList)
        }, 132000)

        setInterval(() => {
            console.log('==== MEDIUM REQ ====')
            console.timeLog('Timer')
            requestAndUpdate(mediumAccountList, mediumApiKeyList)
        }, 300000)

        setInterval(() => {
            console.log('==== OPEN SEA REQ ====')
            console.timeLog('Timer')
            requestAndUpdate(openseaAccountList, openseaApiKeyList)
        }, 900000)

        setInterval(() => {
            console.log('==== SNAPSHOT REQ ====')
            console.timeLog('Timer')
            requestAndUpdate(snapshotAccountList, snapshotApiKeyList)
        }, 600000)
    }
    catch (err) {
        console.log(err)
        console.timeEnd('Timer')
    }
}

start()


// --- Test ---
// --- Test ---
// --- Test --- 
const startTest = async () => {
    try {
        // await initializeData(youtubeAccountList)
        // await requestAndUpdate(youtubeAccountList, youtubeApiKeyList)
        // await initializeData(twitterAccountList)
        // await requestAndUpdate(twitterAccountList, twitterApiKeyList)
        // await initializeData(mediumAccountList)
        // await requestAndUpdate(mediumAccountList, mediumApiKeyList)
        // await initializeData(snapshotAccountList)
        // await requestAndUpdate(snapshotAccountList, snapshotApiKeyList)
        // await initializeData(openseaAccountList)
        // await requestAndUpdate(openseaAccountList, openseaApiKeyList)
    }
    catch (err) {
        console.log(err)
    }
    
}

// startTest()