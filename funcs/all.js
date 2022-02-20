const axios = require('axios');
const { initializeApp , applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue, DocumentReference } = require('firebase-admin/firestore');
// const { requestAndUpdate, updateCurrentData } = require('../api_request/api')
let Parser = require('rss-parser');
let parser = new Parser();
const serviceAccount = require('../service_account/fcm-test-project-cb938-ab77e4a307d7.json');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

const youtubeCollection = db.collection('youtube');
const twitterCollection = db.collection('twitter');
const mediumCollection = db.collection('medium');
const snapshotCollection = db.collection('snapshot');
const openseaCollection = db.collection('opensea');

let currentData = []
let requestData = []
let currentListOfAccountId = []



// FIRESTORE.JS
// FIRESTORE.JS --- UPDATE TO FIRESTORE

const updateToFirestore = async (data, platform) => {
    try {
        let docRef;
        console.log('------------------------------------- WRITING NEW DATA')
        // for (let i = 0; i < data.length; i++){
        switch(platform) {
            case 'youtube':
                docRef = youtubeCollection.doc(data.accountId);
                break
            case 'twitter':
                docRef = twitterCollection.doc(data.accountId);
                break
            case 'medium':
                // docRef = mediumCollection.doc(new Date().toISOString());
                break
            case 'snapshot':
                docRef = snapshotCollection.doc(data.accountId);
                break
            case 'opensea':
                docRef = openseaCollection.doc(data.accountId);
                break
            default:
                break
        }
        await docRef.set(data);
        // }
    }
    catch (error) {
        console.log('Update to Firestore error: ', error)
    }
}


// FIRESTORE.JS
// FIRESTORE.JS --- FIRST REQUEST 

const firstRequest = async (id, platform, apiKey) => {
    try {
        let response;
        switch(platform){
            case 'youtube':
                console.log('--- NEW YOUTUBE REQUEST START ---')
                const youtubeApiEndPoint = 'https://www.googleapis.com/youtube/v3'
                response = await axios.get(`${youtubeApiEndPoint}/channels?key=${apiKey}&part=snippet&id=${id}`)
                if (!response || response.status !== 200) {
                    console.log('YouTube First Request Error Code: ', response.status)
                    break
                }
                const youtubeChannelThumbnails = response.data.items[0].snippet.thumbnails
                const youtubeChannelTitle = response.data.items[0].snippet.title
                response = await axios.get(`${youtubeApiEndPoint}/playlistItems?playlistId=${'UU'+id.slice(2)}&key=${apiKey}&part=snippet,contentDetails&maxResults=15`)
                if (!response || response.status !== 200) {
                    console.log('YouTube First Request Error Code: ', response.status)
                    break
                }
                const youtubeContent = response.data.items.map(videoData => {
                    return {
                        platform: platform,
                        id: videoData.id,
                        publishedAt: videoData.contentDetails.videoPublishedAt,
                        contentTitle: videoData.snippet.title,
                        contentLink: `https://www.youtube.com/watch?v=${videoData.snippet.resourceId.videoId}`,
                        contentThumbnail: videoData.snippet.thumbnails
                    }
                })
                currentListOfAccountId.push({
                    name: youtubeChannelTitle,
                    accountId: id
                })
                let youtubeUpdateData = {
                    lastRequested: new Date().toISOString(),
                    accountTitle: youtubeChannelTitle,
                    accountId: id,
                    accountThumbnails: youtubeChannelThumbnails,
                    content: youtubeContent,
                }
                await db.collection('youtube').doc(id).set(youtubeUpdateData)
                updateCurrentData(id, 'add', youtubeUpdateData)
                console.log('--- NEW YOUTUBE REQUEST END ---')
                break
            case 'twitter':
                console.log('--- NEW TWITTER REQUEST START ---')
                const twitterConfig = {
                    headers : {
                        'Authorization': `Bearer ${apiKey}`
                    }
                }
                const twitterApiEndPoint = `https://api.twitter.com/2/users/${id}`
                const queryUserFields = [
                    'created_at',
                    'description',
                    'entities',
                    'id',
                    'location',
                    'name',
                    'pinned_tweet_id',
                    'profile_image_url',
                    'url',
                    'username',
                    'verified'
                ].join(',')
                response = await axios.get(`${twitterApiEndPoint}?user.fields=${queryUserFields}&expansions=pinned_tweet_id`, twitterConfig)
                if (!response || response.status !== 200) {
                    console.log('Twitter First Request Error Code: ', response.status)
                    return { success: false, data: `Request failed with code ${response.status}.`}
                }
                const twitterAccountThumbnail = response.data.data.profile_image_url
                const twitterAccountTitle = response.data.data.name
                const twitterAccountId = response.data.data.id
                const twitterAccountUsername = response.data.data.username
                response = await axios.get(`${twitterApiEndPoint}/tweets?tweet.fields=created_at&max_results=15&user.fields=url`, twitterConfig)
                if (!response || response.status !== 200) {
                    console.log('Twitter First Request Error Code: ', response.status)
                    return { success: false, data: `Request failed with code ${response.status}.`}
                }
                const twitterContent = response.data.data.map(tweet => {
                    return {
                        platform: platform,
                        id: tweet.id,
                        publishedAt: tweet.created_at,
                        contentText: tweet.text,
                        contentLink: `https://www.twitter.com/${twitterAccountUsername}/status/${tweet.id}`
                    }
                })
                currentListOfAccountId.push({
                    name: twitterAccountTitle,
                    accountId: twitterAccountId
                })
                let twitterUpdateData = {
                    lastRequested: new Date().toISOString(),
                    accountTitle: twitterAccountTitle,
                    accountId: twitterAccountId,
                    accountThumbnail: twitterAccountThumbnail,
                    accountUsername: twitterAccountUsername,
                    content: twitterContent
                }
                await db.collection('twitter').doc(twitterAccountId).set(twitterUpdateData)
                updateCurrentData(twitterAccountId, 'add', twitterUpdateData)
                break
            case 'medium':
                // MEDIUM REQUEST --------------------------
                // MEDIUM REQUEST --------------------------
                break
            case 'snapshot':
                response = await axios({
                    url: 'https://hub.snapshot.org/graphql',
                    method: 'get',
                    data: {
                        query: `
                            query {
                                space(id: "${id}") {
                                id
                                name
                                about
                                network
                                symbol
                                members
                                }
                            }
                        `
                    }
                });
                if (!response || response.status !== 200) {
                    console.log('Snapshot First Request Error Code: ', response.status)
                    return { success: false, data: `Request failed with code ${response.status}.`}
                }
                console.log(response.data)
                if (!response.data.data.space) {
                    console.log('NO DATA RETURNED')
                    return { success: false, data: 'Request returned nothing.'}
                }
                const snapshotAccountName = response.data.data.space.name
                const snapshotAccountSymbol = response.data.data.space.symbol
                const snapshotAccountAbout = response.data.data.space.about
                response = await axios({
                    url: 'https://hub.snapshot.org/graphql',
                    method: 'get',
                    data: {
                        query: `
                        query Proposals {
                            proposals(first: 10, skip: 0, where: {space_in: ["${id}"], state: "active, closed, pending"}, orderBy: "created", orderDirection: desc) {
                              id
                              title
                              body
                              choices
                              start
                              end
                              snapshot
                              state
                              author
                              space {
                                id
                                name
                              }
                            }
                          }
                        `
                    }
                })
                if (!response || response.status !== 200) {
                    console.log('Snapshot First Request Error Code: ', response.status)
                    return { success: false, data: `Request failed with code ${response.status}.`}
                }
                console.log(response.data)
                if (!response.data.data.proposals) {
                    console.log('NO DATA RETURNED')
                    return { success: false, data: 'Request returned nothing.'}
                }
                const snapshotContent = response.data.data.proposals.map(proposal => {
                    return {
                        platform: platform,
                        id: proposal.id,
                        contentTitle: proposal.title,
                        contentState: proposal.state,
                        contentLink: `https://snapshot.org/#/${id}/proposal/${proposal.id}`
                    } 
                })
                currentListOfAccountId.push({
                    name: snapshotAccountName,
                    accountId: id
                })
                const snapshotUpdateData = {
                    lastRequested: new Date().toISOString(),
                    accountTitle: snapshotAccountAbout,
                    accountId: id,
                    accountName: snapshotAccountName,
                    accountSymbol: snapshotAccountSymbol,
                    daoLink: `https://snapshot.org/#/${id}`,
                    content: snapshotContent
                }
                await db.collection('snapshot').doc(id).set(snapshotUpdateData)
                updateCurrentData(id, 'add', snapshotUpdateData)
                break
            case 'opensea':
                response = await axios.get(`https://api.opensea.io/api/v1/collection/${id}`)
                if (response.status !== 200) {
                    console.log('Open Sea First Request Error Code: ', response.status)
                    return { success: false, data: `Request failed with code ${response.status}.`}
                }
                currentListOfAccountId.push({
                    name: response.data.collection.primary_asset_contracts.name,
                    accountId: id
                })
                console.log(response.data.collection)
                const openseaUpdateData = {
                    lastRequestTime: new Date().toISOString(),
                    accountId: id,
                    accountName: response.data.collection.name,
                    accountThumbnail: response.data.collection.image_url,
                    content: response.data.collection.stats
                }
                await db.collection('opensea').doc(id).set(openseaUpdateData)
                updateCurrentData(id, 'add', openseaUpdateData)
                break
            default:
                break
        }
    }
    catch (err) {
        console.log('First Request Error: ', err)
    }
}


// FIRESTORE.JS
// FIRESTORE.JS --- GET ACCOUNT ID

const getAccountID = async (id, platform, apiKey) => {
    try {
        let response;
        switch (platform) {
            case 'youtube':
                response = await axios.get(`https://www.googleapis.com/youtube/v3/videos?key=${apiKey}&id=${id}&part=snippet,id`)
                if (!response || response.status !== 200) {
                    console.log('YouTube First Request Error Code: ', response.status)
                    return { success: false, data: `Request failed with code ${response.status}.`}
                }
                if (response.data.items.length === 0) {
                    console.log('NO DATA RETURNED')
                    return { success: false, data: 'Request returned nothing.' }
                }
                return { success: true, data: response.data.items[0].snippet.channelId }
            case 'twitter':
                config = {
                    headers : {
                        'Authorization': `Bearer ${apiKey}`
                    }
                }
                const isNum = /^\d+$/.test(id)
                if (isNum){
                    response = await axios.get(`https://api.twitter.com/2/tweets?ids=${id}&tweet.fields=created_at&expansions=author_id&user.fields=created_at`, config)
                    if (!response || response.status !== 200) {
                        console.log('Twitter First Request Error Code: ', response.status)
                        return { success: false, data: `Request failed with code ${response.status}.`}
                    }
                    if (response.data.errors) {
                        console.log('NO DATA RETURNED')
                        return { success: false, data: 'Request returned nothing.' }
                    }
                    return { success: true, data: response.data.includes.users[0].id }
                }
                else {
                    response = await axios.get(`https://api.twitter.com/2/users/by/username/${id}`, config)
                    if (!response || response.status !== 200) {
                        console.log('Twitter First Request Error Code: ', response.status)
                        return { success: false, data: `Request failed with code ${response.status}.`}
                    }
                    if (response.data.errors) {
                        console.log('NO DATA RETURNED')
                        return { success: false, data: 'Request returned nothing.' }
                    }
                    return { success: true, data: response.data.data.id }
                }
            case 'medium':
                break
            case 'snapshot':
                return { success: true, data: id }
            case 'opensea':
                return { success: true, data: id }
            default:
                break
        }
    }
    catch (err) {
        console.log('Get Account ID Error!')
    }
}


// FIRESTORE.JS
// FIRESTORE.JS --- SEND ERROR TO FIRESTORE

const sentErrorToFirestore = (error) => {
    db.collection('errors').doc(new Date().toISOString()).set({ errorMessage: error})
}


// FIRESTORE.JS
// FIRESTORE.JS --- FIRESTORE LISTENER

const firestoreListener = async (platform, apiKeyList, apiData) => {
    const firestoreData = await db.collection(platform).get()
    firestoreData.forEach(data => {
        console.log(data.id)
        currentListOfAccountId.push({
            name: data.data().accountTitle,
            accountId: data.data().accountId
        })
        updateCurrentData(data.id, 'add', data.data())
    })

    db.collection(`--request-${platform}`).onSnapshot(async (snapshot) => {
        if (!snapshot.docs.length){
            return
        }
        let doc;
        for (let i = 0; i < snapshot.docs.length; i++){
            doc = snapshot.docs[i]
            if (requestData.includes(doc.id)) break;
            requestData.push(doc.id)
            if (doc.data().type === 'add') {
                const result = await getAccountID(doc.id, platform, apiKeyList[1])
                console.log(result)
                if (!result.success) {
                    sentErrorToFirestore(result.data)
                    continue
                }
                const newAccountId = result.data
                let notNew = currentListOfAccountId.some(account => account.accountId === newAccountId)
                console.log(newAccountId, notNew)
                if (!notNew) {
                    await firstRequest(newAccountId, platform, apiKeyList[1])
                }
            }
            else {
                db.collection(platform).doc(doc.id).delete()
                updateCurrentData(doc.id, 'remove', null)
                currentListOfAccountId = currentListOfAccountId.filter(account => account.accountId !== doc.id)
            }
        }
        deleteRequestData(requestData[0], platform)
    }, err => {
        console.log('Request from Firestore Error: ', err)
    })

    // CALL REPEATEDLY
    startRepeatedRequests(apiData, apiKeyList[0])
}


// FIRESTORE.JS
// FIRESTORE.JS --- DELETE REQUEST DATA

const deleteRequestData = (id, platform) => {
    try {
        console.log('To be deleted: ', id)
        db.collection(`--request-${platform}`).doc(id).delete()
        requestData = requestData.filter(data => data !== id)
    }
    catch (err) {
        console.log('Delete Request Data Error: ', err)
    }
}


// FIRESTORE.JS
// FIRESTORE.JS --- START REPEATED REQUEST

const startRepeatedRequests = (apiData, apiKey) => {
    try {
        console.time('Timer')

        setInterval(() => {
            console.log(`=== ${apiData.requestInfo.platform.toUpperCase()} ===`)
            console.timeLog('Timer')
            requestAndUpdate(apiData, apiKey)
        }, apiData.requestInfo.requestInterval)
    }
    catch (err) {
        console.log(`${platform} firestore error: `, err)
    }
}



// API.JS
// API.JS --- UPDATE CURRENT DATA

const updateCurrentData = (id, type, data) => {
    try {
        if (type === 'remove') {
            currentData = currentData.filter(data => data.accountId !== id)
        }
        else if (type === 'add') {
            currentData.push(data)
        }
        else {
            console.log('Unkown type!')
        }
        console.log(currentData)
    }
    catch (error) {
        console.log("Update Current Data Error: ", error);
    }
};


// API.JS
// API.JS --- REQUEST AND UPDATE --- ENTRY POINT: REPEATEDLY CALLED

let copiedCurrentData = []

const requestAndUpdate = async (apiData, apiKey) => {
    try {
        let requestedData;
        copiedCurrentData = [...currentData]

        for (let accountIndex = 0; accountIndex < copiedCurrentData.length; accountIndex++) {
            setTimeout(async function() {
                requestedData = await request(apiData, accountIndex, apiKey)
                if (requestedData !== null) {
                    await update(apiData, accountIndex, requestedData)
                }
            }, accountIndex * apiData.requestInfo.timeOut)
        }
    }
    catch (error) {
        console.log("Request & Update Error: ", error);
    }
};


// API.JS
// API.JS --- REQUEST

const request = async (apiData, accountIndex, apiKey) => {
    try {
        const account = copiedCurrentData[accountIndex];
        let apiQuery = '';
        let config = {};
        let response = {};
        const currentRequestTime = new Date().toISOString();
        switch(apiData.requestInfo.platform){
            case 'youtube':
                apiQuery = `&part=snippet,contentDetails&maxResults=15&playlistId=${'UU'+account.accountId.slice(2)}&key=${apiKey}`;
                response = await axios.get(apiData.requestInfo.apiRoot.concat(apiQuery));
                break;
            case 'twitter':
                const lastRequestTime = copiedCurrentData[accountIndex].lastRequested
                console.log(lastRequestTime)
                config = {
                    headers: {
                        'Authorization': `Bearer ${apiKey}`
                    }
                };
                apiQuery = `${account.accountUsername}&start_time=${lastRequestTime}&granularity=day`;
                response = await axios.get(apiData.requestInfo.apiRoot[1].concat(apiQuery), config);
                if (response.status === 200 && response.data.meta.total_tweet_count === 0){
                    response = {
                        status: null
                    }
                    break
                }
                apiQuery = `/${account.accountId}/tweets?tweet.fields=created_at,entities&max_results=15`;
                response = await axios.get(apiData.requestInfo.apiRoot[0].concat(apiQuery), config);
                break;
            case 'medium':
                // apiQuery = `${account.name}`;
                // response = await axios.get(apiData.requestInfo.apiRoot.concat(apiQuery));
                break;
            case 'snapshot':
                response = await axios({
                    url: apiData.requestInfo.apiRoot,
                    method: 'get',
                    data: {
                        query : `
                            query Proposals {
                                proposals(first: 20, skip: 0, where: {space_in: ["${account.accountId}"], state: "active, closed, pending"}, orderBy: "created", orderDirection: desc) {
                                id
                                title
                                body
                                choices
                                start
                                end
                                snapshot
                                state
                                author
                                space {
                                    id
                                    name
                                }
                                }
                            }
                        `
                    }
                });
                break;
            case 'opensea':
                response = await axios.get(apiData.requestInfo.apiRoot.concat(account.accountId));
                break;
            default:
                console.log('Platform Error: Platform does not exist.');
                return null;
        }

        copiedCurrentData[accountIndex].lastRequested = currentRequestTime
        
        console.log(response.status);
        if (response && response.status === 200){
            return response.data;
        } 
        else {
            return null;
        }
    }
    catch (error) {
        console.log("Request Error: ", error);
    }
}


// API.JS
// API.JS --- UPDATE

const update = async (apiData, accountIndex, requestedData) => {
    try {
        const account = copiedCurrentData[accountIndex]
        let formattedContent;
        switch(apiData.requestInfo.platform){
            case 'youtube':
                formattedContent = requestedData.items.map(item => {
                    return {
                        platform: apiData.requestInfo.platform,
                        id: item.id,
                        publishedAt: item.contentDetails.videoPublishedAt,
                        contentTitle: item.snippet.title,
                        contentLink: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`,
                        contentThumbnail: item.snippet.thumbnails
                    }
                })
                break
            case 'twitter':
                formattedContent = requestedData.data.map(tweet => {
                    return {
                        platform: apiData.requestInfo.platform,
                        id: tweet.id,
                        publishedAt: tweet.created_at,
                        contentText: tweet.text,
                        contentLink: `https://www.twitter.com/${account.accountUsername}/status/${tweet.id}`
                    }
                })
                break
            case 'medium':
                // requestedData = await parser.parseString(requestedData)
                // formattedContent = requestedData.items.map(item => {
                //     return {
                //         platform: apiData.requestInfo.platform,
                //         id: item.guid,
                //         publishedAt: item.pubDate,
                //         contentTitle: item.title,
                //         contentLink: item.link
                //     }
                // })
                break
            case 'snapshot':
                formattedContent = requestedData.data.proposals.map(proposal => {
                    return {
                        platform: apiData.requestInfo.platform,
                        id: proposal.id,
                        contentTitle: proposal.title,
                        contentState: proposal.state,
                        contentLink: `https://snapshot.org/#/${account.accountId}/proposal/${proposal.id}`
                    }
                })
                break
            case 'opensea':
                formattedContent = requestedData.collection.stats
                break
            default:
                break
        }

        const newData = compare(accountIndex, formattedContent)

        if (newData.length) {
            for (let i = 0; i < currentData.length; i++) {
                if (currentData[i].accountId === copiedCurrentData[accountIndex].accountId) {
                    currentData[i] = copiedCurrentData[accountIndex]
                    await updateToFirestore(copiedCurrentData[accountIndex], apiData.requestInfo.platform)
                }
            }
        }
    }
    catch (error) {
        console.log("Update Error: ", error)
    }
}


// API.JS
// API.JS --- COMPARE

const compare = (accountIndex, formattedContent) => {
    try {
        const isArray = Array.isArray(formattedContent)
        const currentDataToBeCompared = copiedCurrentData[accountIndex].content
        copiedCurrentData[accountIndex].content = formattedContent
        let newData = []
        if (isArray){
            for (let i = 0; i < formattedContent.length; i++){
                if (currentDataToBeCompared[0].id === formattedContent[i].id){
                    break
                }
                newData.push(formattedContent[i])
            }
        }
        else {
            for (key in formattedContent){
                if (formattedContent[key] !== currentDataToBeCompared[key]){
                    newData.push(formattedContent)
                    break
                }
            }
        }
        return newData
    }
    catch (error) {
        console.log('Compare Error: ', error)
    }
}




module.exports = { firestoreListener }

