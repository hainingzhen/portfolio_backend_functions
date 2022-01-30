const { requestAndUpdate, initializeData } = require('../api_request/api')
const { openseaApiKeyList } = require('../api_keys')

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
        await initializeData(openseaApiData)

        console.time('Timer')

        setInterval(() => {
            console.log('==== OPEN SEA REQ ====')
            console.timeLog('Timer')
            requestAndUpdate(openseaApiData, openseaApiKeyList)
        }, 900000)
    }
    catch (err) {
        console.log(err)
        console.timeEnd('Timer')
    }
}

start()


const startTest = async () => {
    try {
        await initializeData(openseaApiData)
        
        await requestAndUpdate(openseaApiData, openseaApiKeyList)
    }
    catch (err) {
        console.log(err)
    }
    
}

// startTest()