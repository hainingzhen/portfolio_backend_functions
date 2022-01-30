const axios = require('axios');
// const { v4: uuidv4 } = require('uuid');
const { readFile, writeFile } = require('fs').promises;
const updateToFirestore = require('../firebase-firestore/firestore')
let Parser = require('rss-parser');
let parser = new Parser();

let currentData;

// --- Entry Point: Called Once
const initializeData = async (apiData) => {
    try {
        // Initialize all of accounts in the list
        const data = apiData.list.map((account) => {
            return {
                name: account.name,
                accountId: account.accountId ? account.accountId : null,
                uploadListId: account.uploadListId ? account.uploadListId : null,
                initializedAt: new Date().toISOString(),
                lastEdited: null,
                lastRequested: null,
                content: null,
            }
        });
        await writeFile(apiData.requestInfo.filePath, JSON.stringify(data));
    }
    catch (error) {
        console.log("Initialisation error: ", error);
    }
};


// --- Entry Point: Repeatedly Called
const requestAndUpdate = async (apiData, apiKeyList) => {
    try {
        // Read the current data from the JSON files
        currentData = await readFile(apiData.requestInfo.filePath, 'utf8')
        currentData = JSON.parse(currentData)
        let requestedData;
        // Run through the current list of accounts to make API requests
        for (let accountIndex = 0; accountIndex < apiData.list.length; accountIndex++) {
            setTimeout(async function() {
                requestedData = await request(apiData, accountIndex, apiKeyList)
                if (requestedData !== null) {
                    await update(apiData, accountIndex, requestedData)
                }
                if (accountIndex === apiData.list.length - 1){
                    await writeFile(apiData.requestInfo.filePath, JSON.stringify(currentData))
                }
            }, accountIndex * apiData.requestInfo.timeOut)
        }
    }
    catch (error) {
        console.log("Request & Update Error: ", error);
    }
};


// Called By: requestAndUpdate
const request = async (apiData, accountIndex, apiKeyList) => {
    try {
        const account = apiData.list[accountIndex]
        let apiQuery = '';
        let config = {};
        let response = {};
        const currentRequestTime = new Date().toISOString();
        switch(apiData.requestInfo.platform){
            case 'youtube':
                apiQuery = `&part=snippet&maxResults=2&playlistId=${account.uploadListId}&key=${apiKeyList[0]}`;
                response = await axios.get(apiData.requestInfo.apiRoot.concat(apiQuery));
                break;
            case 'twitter':
                const lastRequestTime = currentData[accountIndex].lastRequested
                config = {
                    headers: {
                        'Authorization': `Bearer ${apiKeyList[0]}`
                    }
                };
                if (lastRequestTime !== null){
                    apiQuery = `${account.name}&start_time=${lastRequestTime}&granularity=day`;
                    response = await axios.get(apiData.requestInfo.apiRoot[1].concat(apiQuery), config);
                    console.log(response.data.meta.total_tweet_count)
                    if (response.status === 200 && response.data.meta.total_tweet_count === 0){
                        response = {
                            status: null
                        }
                        break;
                    }
                }
                apiQuery = `/${account.accountId}/tweets?tweet.fields=created_at,entities&max_results=5`;
                response = await axios.get(apiData.requestInfo.apiRoot[0].concat(apiQuery), config);
                break;
            case 'medium':
                apiQuery = `${account.name}`;
                response = await axios.get(apiData.requestInfo.apiRoot.concat(apiQuery));
                break;
            case 'snapshot':
                response = await axios({
                    url: apiData.requestInfo.apiRoot,
                    method: 'get',
                    data: {
                        query : `
                            query Proposals {
                                proposals(first: 20, skip: 0, where: {space_in: ["${account.name}"], state: "active, closed"}, orderBy: "created", orderDirection: desc) {
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
                response = await axios.get(apiData.requestInfo.apiRoot.concat(account.name));
                break;
            default:
                console.log('Platform Error: Platform does not exist.');
                return null;
        }

        currentData[accountIndex].lastRequested = currentRequestTime

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


// Called By: requestAndUpdate
const update = async (apiData, accountIndex, requestedData) => {
    try {
        const account = apiData.list[accountIndex]
        let formattedContent;
        switch(apiData.requestInfo.platform){
            case 'youtube':
                formattedContent = requestedData.items.map(item => {
                    return {
                        platform: apiData.requestInfo.platform,
                        accountTitle: item.snippet.channelTitle,
                        accountId: item.snippet.channelId,
                        id: item.id,
                        publishedAt: item.snippet.publishedAt,
                        contentTitle: item.snippet.title,
                        contentLink: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`,
                        contentThumbnail: item.snippet.thumbnails
                    }
                })
                break
            case 'twitter':
                formattedContent = requestedData.data.map(item => {
                    return {
                        platform: apiData.requestInfo.platform,
                        accountTitle: account.name,
                        accountId: account.accountId,
                        id: item.id,
                        publishedAt: item.created_at,
                        contentLink: `https://www.twitter.com/${account.name}/status/${item.id}`
                    }
                })
                break
            case 'medium':
                requestedData = await parser.parseString(requestedData)
                formattedContent = requestedData.items.map(item => {
                    return {
                        platform: apiData.requestInfo.platform,
                        accountTitle: account.name,
                        accountId: account.accountId,
                        id: item.guid,
                        publishedAt: item.pubDate,
                        contentTitle: item.title,
                        contentLink: item.link
                    }
                })
                break
            case 'snapshot':
                formattedContent = requestedData.data.proposals.map(proposal => {
                    return {
                        platform: apiData.requestInfo.platform,
                        accountTitle: account.name,
                        accountId: account.accountId,
                        id: proposal.id,
                        contentTitle: proposal.title,
                        contentLink: `https://snapshot.org/#/${account.name}/proposal/${proposal.id}`,
                        state: proposal.state,
                        daoLink: `https://snapshot.org/#/${account.name}`
                    }
                })
                break
            case 'opensea':
                formattedContent = {
                    platform: apiData.requestInfo.platform,
                    accountTitle: account.name,
                    accountId: account.accountId,
                    contentTitle: requestedData.collection.name,
                    contentLink: `https://opensea.io/collection/${account.name}`,
                    statistics: requestedData.collection.stats,
                    userProfileImage: requestedData.collection.image_url
                }
                break
            default:
                break
        }

        const newData = await compare(accountIndex, formattedContent)

        if (newData.length) {
            console.log('New Data Obtained')
            currentData[accountIndex].lastEdited = new Date().toISOString()
            await updateToFirestore(newData)
            console.log(newData)
        }
    }
    catch (err) {
        console.log("Update Error: ", err)
    }
}


const compare = async (accountIndex, formattedContent) => {
    try {
        const isArray = Array.isArray(formattedContent)
        let currentDataToBeCompared = currentData[accountIndex].content
        currentData[accountIndex].content = formattedContent
        if (currentDataToBeCompared === null) {
            console.log('Initial Fill')
            return isArray ? formattedContent : [formattedContent]
        }
        const id = isArray ? formattedContent[0].accountId : formattedContent.accountId
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
            const statistics = formattedContent.statistics
            for (key in statistics){
                if (statistics[key] !== currentDataToBeCompared.statistics[key]){
                    newData.push(formattedContent)
                    break
                }
            }
        }
        return newData
    }
    catch (err) {
        console.log('Compare Error: ', err)
    }
}

module.exports = { requestAndUpdate, initializeData }