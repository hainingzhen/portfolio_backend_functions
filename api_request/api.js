const axios = require('axios')
const { v4: uuidv4 } = require('uuid')
const { readFile, writeFile, appendFile } = require('fs').promises
let Parser = require('rss-parser')
let parser = new Parser()

let apiStatus = {
    youtube: 'notRunning',
    twitter: 'notRunning',
    medium: 'notRunning',
    snapshot: 'notRunning',
    opensea: 'notRunning'
}

// --- Entry Point: Called Once
const initializeData = async (accountList) => {
    try {
        const data = accountList.list.map((account) => {
            return {
                name: account.name,
                accountId: account.accountId ? account.accountId : null,
                uploadListId: account.uploadListId ? account.uploadListId : null,
                content: null,
            }
        })
        await writeFile(accountList.filePath, JSON.stringify(data))
    }
    catch (error) {
        console.log("Initialisation error: ", error)  
    }
}


// --- Entry Point: Repeatedly Called
const requestAndUpdate = async (accountList, apiKeyList) => {
    try {
        accountList.list.forEach(async (account, i) => {
            console.log("Account Data To Be Requested: ", account)
            let requestedData
            setTimeout(async function() {
                requestedData = await request(accountList, account, apiKeyList)
                if (requestedData !== null) {
                    await update(accountList, account, requestedData)
                }
            }, i * accountList.timeout)
        })
    }
    catch (error) {
        console.log("Request & Update Error: ", error)
    }
}


// Called By: requestAndUpdate
const request = async (accountList, account, apiKeyList) => {
    try {
        let apiQuery = ''
        let config = {}
        let response = {}
        switch(accountList.platform){
            case 'youtube':
                apiQuery = `&part=snippet&maxResults=2&playlistId=${account.uploadListId}&key=${apiKeyList[0]}`
                response = await axios.get(accountList.apiRoot.concat(apiQuery))
                break
            case 'twitter':
                apiQuery = `/${account.accountId}/tweets?tweet.fields=created_at,entities&max_results=5`
                config = {
                    headers: {
                        'Authorization': `Bearer ${apiKeyList[0]}`
                    }
                }
                response = await axios.get(accountList.apiRoot.concat(apiQuery), config)
                break
            case 'medium':
                apiQuery = `${account.name}`
                response = await axios.get(accountList.apiRoot.concat(apiQuery))
                break
            case 'snapshot':
                response = await axios({
                    url: accountList.apiRoot,
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
                })
                break
            case 'opensea':
                response = await axios.get(accountList.apiRoot.concat(account.name))
                break
            default:
                console.log('Platform Error: Platform does not exist.')
                return null
        }
        console.log(response.status)
        if (response && response.status === 200){
            return response.data
        } 
        else {
            return null
        }
    }
    catch (error) {
        console.log("Request Error: ", error)
    }
}


// Called By: requestAndUpdate
const update = async (accountList, account, requestedData) => {
    try {
        let formattedContent
        switch(accountList.platform){
            case 'youtube':
                formattedContent = requestedData.items.map(item => {
                    return {
                        platform: accountList.platform,
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
                        platform: accountList.platform,
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
                        platform: accountList.platform,
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
                        platform: accountList.platform,
                        accountTitle: account.name,
                        accountId: account.accountId,
                        id: proposal.id,
                        contentTitle: proposal.title,
                        contentLink: `https://snapshot.org/#/${account.name}/proposal/${proposal.id}`,
                        status: proposal.status,
                        daoLink: `https://snapshot.org/#/${account.name}`
                    }
                })
                break
            case 'opensea':
                formattedContent = {
                    platform: accountList.platform,
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

        const { newData, currentData } = await compare(accountList, formattedContent)

        if (newData.length > 0) {
            await sendData(newData)
            await writeFile(accountList.filePath, JSON.stringify(currentData))
            // console.log('Need to write file: ', currentData[0])
        }
    }
    catch (err) {
        console.log("Update Error: ", err)
    }
}


const compare = async (accountList, formattedContent) => {
    try {
        let currentData = await readFile(accountList.filePath, 'utf8')
        currentData = JSON.parse(currentData)
        const isArray = Array.isArray(formattedContent)
        const id = isArray ? formattedContent[0].accountId : formattedContent.accountId
        let currentDataToBeCompared
        let newData = []
        for (let i = 0; i < currentData.length; i++){
            if (currentData[i].accountId === id){
                currentDataToBeCompared = currentData[i].content
                currentData[i].content = formattedContent
                break
            }
        }
        // console.log('Current Data To be Compared: ', currentDataToBeCompared)
        if (currentDataToBeCompared === null) {
            await writeFile(accountList.filePath, JSON.stringify(currentData))
            return { newData, currentData }
        }
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
                // console.log(statistics[key], currentDataToBeCompared.statistics[key])
                if (statistics[key] !== currentDataToBeCompared.statistics[key]){
                    newData.push(formattedContent)
                    break
                }
            }
        }
        return { newData, currentData }
    }
    catch (err) {
        console.log('Compare Error: ', err)
    }
}


const sendData = async (dataToSend) => {
    // console.log('Data To Send: ', dataToSend)
    try {
        await appendFile(
            '/Users/zhenhaining/Documents/portfolio/personal-social-feed/backend/api'+'/update/update_list.txt', 
            JSON.stringify(dataToSend) + '\n')
    }
    catch (err) {
        console.log('Send Data Error: ', err)
    }
}


module.exports = { requestAndUpdate, initializeData }