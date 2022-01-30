const { requestAndUpdate, initializeData } = require('../api_request/api')
const { mediumApiKeyList } = require('../api_keys')

const mediumApiData = {
    requestInfo: {
        platform: 'medium',
        filePath: __dirname + '/api_result/medium.json',
        apiRoot: 'https://medium.com/feed/@',
        timeOut: 600,
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


const start = async () => {
    try {
        await initializeData(mediumApiData)

        console.time('Timer')

        setInterval(() => {
            console.log('==== MEDIUM REQ ====')
            console.timeLog('Timer')
            requestAndUpdate(mediumApiData, mediumApiKeyList)
        }, 300000)
    }
    catch (err) {
        console.log(err)
        console.timeEnd('Timer')
    }
}

start()