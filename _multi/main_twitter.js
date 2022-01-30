const { requestAndUpdate, initializeData } = require('../api_request/api')
const { twitterApiKeyList } = require('../api_keys')

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


const start = async () => {
    try {
        await initializeData(twitterApiData)

        console.time('Timer')
        
        setInterval(() => {
            console.log('==== TWITTER REQ ====')
            console.timeLog('Timer')
            requestAndUpdate(twitterApiData, twitterApiKeyList)
        }, 120000)
    }
    catch (err) {
        console.log(err)
        console.timeEnd('Timer')
    }
}

start()