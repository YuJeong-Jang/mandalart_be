"use strict";
const admin = require("firebase-admin");
const serviceAccount = require("../credentials/mandalart.json");
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

const db = admin.firestore();
console.log(`firebaseAdmin initialized: ${new Date()}`);

module.exports = db;
