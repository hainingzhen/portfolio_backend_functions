const { initializeApp , applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue, DocumentReference } = require('firebase-admin/firestore');

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

const updateToFirestore = async (data) => {
    try {
        let docRef;
        for (let i = 0; i < data.length; i++){
            switch(data[0].platform) {
                case 'youtube':
                    docRef = youtubeCollection.doc(new Date().toISOString());
                    break
                case 'twitter':
                    docRef = twitterCollection.doc(new Date().toISOString());
                    break
                case 'medium':
                    docRef = mediumCollection.doc(new Date().toISOString());
                    break
                case 'snapshot':
                    docRef = snapshotCollection.doc(new Date().toISOString());
                    break
                case 'opensea':
                    docRef = openseaCollection.doc(new Date().toISOString());
                    break
                default:
                    break
            }
            await docRef.set(data[i]);
        }
    }
    catch (error) {
        console.log(error)
    }
}


let newData = []

const doSomethingWithNewData = (data) => {
    if (data.length > 1){
        console.log('More than one: ')
        data.forEach(d => {
            console.log(d)
        })
    }
    else {
        console.log('New Data: ', data)
    
    }
}


const deleteOldData = async (id) => {
    try {
        await db.collection('request').doc(id).delete()
    }
    catch (err) {
        console.log('Delete Old Data Error: ', err)
    }
}


const firestoreListener = (platform) => {
    db.collection(`request-${platform}`).onSnapshot(async (snapshot) => {
        if (!snapshot.docs.length){
            return
        }
        snapshot.docs.forEach((doc) => {
            if (!newData.includes(doc.id)){
                newData.push(doc.id)
            }
        })
        doSomethingWithNewData(newData)
        await deleteOldData(newData[0])
        newData.shift() 
        
    }, err => {
        console.log('Request from Firestore Error: ', err)
    })
}


module.exports = { updateToFirestore, firestoreListener }

