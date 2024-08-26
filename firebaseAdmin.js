const admin = require("firebase-admin");
const { Storage } = require('@google-cloud/storage');

admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    storageBucket: "gs://really-estate-20da2.appspot.com/"
});

const storage = new Storage();
const bucket = storage.bucket("gs://really-estate-20da2.appspot.com/");

const corsConfiguration = [
    {
        origin: ["*"],
        method: ["GET", "POST", "DELETE"],
        responseHeader: ["Content-Type"],
        maxAgeSeconds: 3600,
    },
];

bucket.setCorsConfiguration(corsConfiguration)
    .then(() => {
        console.log('CORS configuration updated successfully');
    })
    .catch((error) => {
        console.error('Error updating CORS configuration:', error);
    });