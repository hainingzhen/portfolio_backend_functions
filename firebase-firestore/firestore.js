const { initializeApp , applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');

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
        for (let i = 0; i < data.length; i++){
            switch(data[0].platform) {
                case 'youtube':
                    const youtubeAccountDocRef = youtubeCollection.doc(new Date().toISOString());
                    await youtubeAccountDocRef.set(data[i]);
                    break
                case 'twitter':
                    const twitterAccountDocRef = twitterCollection.doc(new Date().toISOString());
                    await twitterAccountDocRef.set(data[i]);
                    break
                case 'medium':
                    const mediumAccountDocRef = mediumCollection.doc(new Date().toISOString());
                    await mediumAccountDocRef.set(data[i]);
                    break
                case 'snapshot':
                    const snapshotAccountDocRef = snapshotCollection.doc(new Date().toISOString());
                    await snapshotAccountDocRef.set(data[i]);
                    break
                case 'opensea':
                    const openseaAccountDocRef = openseaCollection.doc(new Date().toISOString());
                    await openseaAccountDocRef.set(data[i]);
                    break
                default:
                    break
            }

        }
    }
    catch (error) {
        console.log(error)
    }
}

module.exports = updateToFirestore

