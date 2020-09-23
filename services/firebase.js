
'use strict';
const firebaseKey = require("firebase-key");
const functions = require('');

//https://firebase.google.com/docs/reference/admin/node
const admin = require('firebase-admin');

require('dotenv').config();
admin.initializeApp({
  credential: admin.credential.cert({
    "private_key": process.env.FIREBASE_PRIVATE_KEY,
    "client_email": process.env.FIREBASE_CLIENT_EMAIL,
  }),
  databaseURL: process.env.FIREBASE_DB_URL
});
const db = admin.database();

module.exports = {
  db,
  imports: db.userRef('imports'),
  encode: (str) => {
    return firebaseKey.encode(str)
  },
  decode: (key) => {

    return firebaseKey.decode(key)
  }
};