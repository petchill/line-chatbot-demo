import admin from 'firebase-admin'
const serviceAccount = require(process.env.FIREBASE_CREDENTIAL)

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://line-liff-demo-9fe4f-default-rtdb.firebaseio.com"
});

const db = admin.database()
export { admin, db };
