# Backend Functions for Personal Social and Crypto Feed Web App

This repo contains the backend code that provides functionality to the frontend web app.

Link to frontend app: https://personal-crypto-social-feed.web.app/ 

Link to frontend GitHub: https://github.com/hainingzhen/personal-crypto-social-feed 

The functions are running on a Raspberry Pi connected to Google Firebase.


It handles the following:

1. Adding and removing subscriptions
2. Listens to Firestore database for changes from the frontend
3. Makes repeated API requests to get the latest data and updates to Firestore