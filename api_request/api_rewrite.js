const axios = require('axios');
const { readFile, writeFile } = require('fs').promises;
let Parser = require('rss-parser');
let parser = new Parser();


// --- Entry Point: Called Once
const initializeData = async (apiData) => {
    try {
        const data = apiData.list.map((account) => {
            return {
                name: account.name,
                accountId: account.accountId ? account.accountId : null,
                uploadListId: account.uploadListId ? account.uploadListId : null,
                initialized: new Date().toISOString(),
                lastEdited: null,
                lastRequested: null,
                content: null,
            };
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
        apiData.list.forEach((account, i) => {
            console.log("Account Data To Be Requested: ", account);
            let requestedData;
            setTimeout(async function() {
                requestedData = await request(apiData.requestInfo, account, apiKeyList);
                if (requestedData !== null) {
                    await update(apiData.requestInfo, account, requestedData);
                };
            }, i * apiData.requestInfo.timeOut);
        });
    }
    catch (error) {
        console.log("Request & Update Error: ", error);
    }
};


module.exports = { initializeData, requestAndUpdate }