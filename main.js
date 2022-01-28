const { requestAndUpdate, initializeData } = require('./api_request/api')
const { 
    youtubeApiKeyList, 
    twitterApiKeyList, 
    mediumApiKeyList, 
    snapshotApiKeyList,
    openseaApiKeyList
} = require('./api_keys')

const { v4: uuidv4 } = require('uuid');


const youtubeApiData = {
    requestInfo: {
        platform: 'youtube',
        filePath: __dirname + '/api_result/youtube.json',
        apiRoot: 'https://www.googleapis.com/youtube/v3/playlistItems?',
        timeOut: 500,
    },
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
        {
            name: 'Marques Brownlee',
            accountId: 'UCBJycsmduvYEL83R_U4JriQ',
            uploadListId: 'UUBJycsmduvYEL83R_U4JriQ'
        },
        {
            name: 'IGN',
            accountId: 'UCKy1dAqELo0zrOtPkf0eTMw',
            uploadListId: 'UUKy1dAqELo0zrOtPkf0eTMw'
        },
        {
            name: 'BBC News',
            accountId: 'UC16niRr50-MSBwiO3YDb3RA',
            uploadListId: 'UU16niRr50-MSBwiO3YDb3RA'
        },
        {
            name: 'Nintendo',
            accountId: 'UCGIY_O-8vW4rfX98KlMkvRg',
            uploadListId: 'UUGIY_O-8vW4rfX98KlMkvRg'
        },
        {
            name: 'Blockworks',
            accountId: 'UCkrwgzhIBKccuDsi_SvZtnQ',
            uploadListId: 'UUkrwgzhIBKccuDsi_SvZtnQ'
        },
    ]
}

const twitterApiData = {
    requestInfo: {
        platform: 'twitter',
        filePath: __dirname + '/api_result/twitter.json',
        apiRoot: [
            'https://api.twitter.com/2/users', 
            'https://api.twitter.com/2/tweets/counts/recent?query=from%3A'
        ],
        timeOut: 500
    },
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
        },
        {
            name: 'MarcusRashford',
            accountId: '734492654755577858'
        },
        {
            name: 'IGN',
            accountId: '18927441'
        },
        {
            name: 'novaramedia',
            accountId: '601148365'
        },
        {
            name: 'BBCBreaking',
            accountId: '5402612'
        },
        {
            name: 'coinbureau',
            accountId: '906230721513181184'
        },
    ]
}

const mediumApiData = {
    requestInfo: {
        platform: 'medium',
        filePath: __dirname + '/api_result/medium.json',
        apiRoot: 'https://medium.com/feed/@',
        timeOut: 500,
    },
    list: [
        {
            name: 'barackobama',
            accountId: '59640693-1304-436f-83ab-4c4fdaf8b42a'
        },
        {
            name: 'michael-thompson',
            accountId: '6b1f7bc2-6a2d-47fc-b9a8-0474c0bd1456'
        },
        {
            name: 'zulie',
            accountId: '38fcf34a-a3e9-484c-8903-15ea8f2456bb'
        },
        {
            name: 'netflixtechblog',
            accountId: 'c805f152-dbd2-44b5-9b4b-89c1cd41f65e'
        },
        {
            name: 'Pinterest_Engineering',
            accountId: '7b2fbb00-8c66-4ca2-8b18-a6bb586be1e8'
        },
        {
            name: 'gogalagames',
            accountId: 'a07a1d2b-5a5f-4488-9d14-869b01abb555'
        },
        {
            name: 'playbigtime',
            accountId: 'fe5b4186-521d-46dd-b25a-ec3d1a7e04a9'
        },
        {
            name: 'axieinfinity',
            accountId: 'eb0eb172-86a7-49d1-af5b-c5152f731947'
        },
    ]
}

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

const openseaApiData = {
    requestInfo: {
        platform: 'opensea',
        filePath: __dirname + '/api_result/opensea.json',
        apiRoot: 'https://api.opensea.io/api/v1/collection/',
        timeOut: 10000,
    },
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
        await initializeData(youtubeApiData)
        await initializeData(twitterApiData)
        await initializeData(mediumApiData)
        await initializeData(snapshotApiData)
        await initializeData(openseaApiData)

        console.time('Timer')

        setInterval(() => {
            console.log('==== YOUTUBE REQ ====')
            console.timeLog('Timer')
            requestAndUpdate(youtubeApiData, youtubeApiKeyList)
        }, 90000)

        setInterval(() => {
            console.log('==== TWITTER REQ ====')
            console.timeLog('Timer')
            requestAndUpdate(twitterApiData, twitterApiKeyList)
        }, 120000)

        setInterval(() => {
            console.log('==== MEDIUM REQ ====')
            console.timeLog('Timer')
            requestAndUpdate(mediumApiData, mediumApiKeyList)
        }, 300000)

        setInterval(() => {
            console.log('==== OPEN SEA REQ ====')
            console.timeLog('Timer')
            requestAndUpdate(openseaApiData, openseaApiKeyList)
        }, 900000)

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


// --- Test ---
// --- Test ---
// --- Test --- 
const startTest = async () => {
    try {
        await initializeData(youtubeApiData)
        await initializeData(twitterApiData)
        await initializeData(mediumApiData)
        await initializeData(snapshotApiData)
        await initializeData(openseaApiData)
        
        await requestAndUpdate(youtubeApiData, youtubeApiKeyList)
        // await requestAndUpdate(twitterApiData, twitterApiKeyList)
        // await requestAndUpdate(mediumApiData, mediumApiKeyList)
        // await requestAndUpdate(snapshotApiData, snapshotApiKeyList)
        // await requestAndUpdate(openseaApiData, openseaApiKeyList)
    }
    catch (err) {
        console.log(err)
    }
    
}

startTest()

// console.log(new Date().toISOString())

// console.log(uuidv4())
