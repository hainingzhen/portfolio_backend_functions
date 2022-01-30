const { requestAndUpdate, initializeData } = require('./api_request/api')
const { youtubeApiKeyList } = require('./api_keys')

const youtubeApiData = {
    requestInfo: {
        platform: 'youtube',
        filePath: __dirname + '../api_result/youtube.json',
        apiRoot: 'https://www.googleapis.com/youtube/v3/playlistItems?',
        timeOut: 2000,
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

const start = () => {
    try {
        initializeData(youtubeApiData)

        console.time('Timer')

        setInterval(() => {
            console.log('==== YOUTUBE ====')
            console.timeLog('Timer')
            requestAndUpdate(youtubeApiData, youtubeApiKeyList)
        }, 90000)
    }
    catch (err) {
        console.log(err)
    }
}

start()