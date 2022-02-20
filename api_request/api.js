const axios = require('axios');
// const { writeFile } = require('fs').promises;
// const { updateToFirestore } = require('../firebase-firestore/updateFirestore')
let Parser = require('rss-parser');
let parser = new Parser();


let currentData = [];



// --- Entry Point: Called Once
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



// --- Entry Point: Repeatedly Called
const requestAndUpdate = async (apiData, apiKey) => {
    try {
        let requestedData;
        // for (let accountIndex = 0; accountIndex < apiData.list.length; accountIndex++) {
        for (let accountIndex = 0; accountIndex < currentData.length; accountIndex++) {
            setTimeout(async function() {
                requestedData = await request(apiData, accountIndex, apiKey)
                if (requestedData !== null) {
                    await update(apiData, accountIndex, requestedData)
                }
                // if (accountIndex === apiData.list.length - 1){
                if (accountIndex === currentData.length - 1) {
                    // await writeFile(apiData.requestInfo.filePath, JSON.stringify(currentData))
                }
            }, accountIndex * apiData.requestInfo.timeOut)
        }
    }
    catch (error) {
        console.log("Request & Update Error: ", error);
    }
};



// Called By: requestAndUpdate
const request = async (apiData, accountIndex, apiKey) => {
    try {
        // const account = apiData.list[accountIndex]
        const account = currentData[accountIndex]
        let apiQuery = '';
        let config = {};
        let response = {};
        const currentRequestTime = new Date().toISOString();
        switch(apiData.requestInfo.platform){
            case 'youtube':
                apiQuery = `&part=snippet&maxResults=15&playlistId=${'UU'+account.accountId.slice(2)}&key=${apiKey}`;
                response = await axios.get(apiData.requestInfo.apiRoot.concat(apiQuery));
                break;
            case 'twitter':
                // const lastRequestTime = currentData[accountIndex].lastRequested
                // config = {
                //     headers: {
                //         'Authorization': `Bearer ${apiKey}`
                //     }
                // };
                // if (lastRequestTime !== null){
                //     apiQuery = `${account.name}&start_time=${lastRequestTime}&granularity=day`;
                //     response = await axios.get(apiData.requestInfo.apiRoot[1].concat(apiQuery), config);
                //     if (response.status === 200 && response.data.meta.total_tweet_count === 0){
                //         response = {
                //             status: null
                //         }
                //         break;
                //     }
                // }
                // apiQuery = `/${account.accountId}/tweets?tweet.fields=created_at,entities&max_results=5`;
                // response = await axios.get(apiData.requestInfo.apiRoot[0].concat(apiQuery), config);
                break;
            case 'medium':
                // apiQuery = `${account.name}`;
                // response = await axios.get(apiData.requestInfo.apiRoot.concat(apiQuery));
                break;
            case 'snapshot':
                // response = await axios({
                //     url: apiData.requestInfo.apiRoot,
                //     method: 'get',
                //     data: {
                //         query : `
                //             query Proposals {
                //                 proposals(first: 20, skip: 0, where: {space_in: ["${account.name}"], state: "active, closed"}, orderBy: "created", orderDirection: desc) {
                //                 id
                //                 title
                //                 body
                //                 choices
                //                 start
                //                 end
                //                 snapshot
                //                 state
                //                 author
                //                 space {
                //                     id
                //                     name
                //                 }
                //                 }
                //             }
                //         `
                //     }
                // });
                break;
            case 'opensea':
                // response = await axios.get(apiData.requestInfo.apiRoot.concat(account.name));
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
        // const account = apiData.list[accountIndex]
        const account = currentData[accountIndex]
        let formattedContent;
        switch(apiData.requestInfo.platform){
            case 'youtube':
                formattedContent = requestedData.items.map(item => {
                    return {
                        // platform: apiData.requestInfo.platform,
                        // accountTitle: item.snippet.channelTitle,
                        // accountId: item.snippet.channelId,
                        id: item.id,
                        publishedAt: item.snippet.publishedAt,
                        contentTitle: item.snippet.title,
                        contentLink: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`,
                        contentThumbnail: item.snippet.thumbnails
                    }
                })
                break
            case 'twitter':
                // formattedContent = requestedData.data.map(item => {
                //     return {
                //         platform: apiData.requestInfo.platform,
                //         accountTitle: account.name,
                //         accountId: account.accountId,
                //         id: item.id,
                //         publishedAt: item.created_at,
                //         contentLink: `https://www.twitter.com/${account.name}/status/${item.id}`
                //     }
                // })
                break
            case 'medium':
                // requestedData = await parser.parseString(requestedData)
                // formattedContent = requestedData.items.map(item => {
                //     return {
                //         platform: apiData.requestInfo.platform,
                //         accountTitle: account.name,
                //         accountId: account.accountId,
                //         id: item.guid,
                //         publishedAt: item.pubDate,
                //         contentTitle: item.title,
                //         contentLink: item.link
                //     }
                // })
                break
            case 'snapshot':
                // formattedContent = requestedData.data.proposals.map(proposal => {
                //     return {
                //         platform: apiData.requestInfo.platform,
                //         accountTitle: account.name,
                //         accountId: account.accountId,
                //         id: proposal.id,
                //         contentTitle: proposal.title,
                //         contentLink: `https://snapshot.org/#/${account.name}/proposal/${proposal.id}`,
                //         state: proposal.state,
                //         daoLink: `https://snapshot.org/#/${account.name}`
                //     }
                // })
                break
            case 'opensea':
                // formattedContent = {
                //     platform: apiData.requestInfo.platform,
                //     accountTitle: account.name,
                //     accountId: account.accountId,
                //     contentTitle: requestedData.collection.name,
                //     contentLink: `https://opensea.io/collection/${account.name}`,
                //     statistics: requestedData.collection.stats,
                //     userProfileImage: requestedData.collection.image_url
                // }
                break
            default:
                break
        }

        // console.log('Formatted Content: ', formattedContent)

        const newData = compare(accountIndex, formattedContent)

        // console.log('New Data: ', newData)

        if (newData.length) {
            currentData[accountIndex].lastEdited = new Date().toISOString()
            // await updateToFirestore(newData)
            await updateToFirestore(currentData[accountIndex], apiData.requestInfo.platform)
        }
    }
    catch (error) {
        console.log("Update Error: ", error)
    }
}



const compare = (accountIndex, formattedContent) => {
    try {
        const isArray = Array.isArray(formattedContent)
        const currentDataToBeCompared = currentData[accountIndex].content
        currentData[accountIndex].content = formattedContent
        if (!currentDataToBeCompared) {
            console.log('Initial Fill')
            return isArray ? formattedContent : [formattedContent]
        }
        // const id = isArray ? formattedContent[0].accountId : formattedContent.accountId
        const id = currentData[accountIndex].accountId
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
    catch (error) {
        console.log('Compare Error: ', error)
    }
}



module.exports = { requestAndUpdate, updateCurrentData }