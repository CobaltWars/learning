   import { initializeApp } from 'firebase/app';
   import { getAuth } from 'firebase/auth';
   import { getDatabase } from 'firebase/database';

   const firebaseConfig = {
     apiKey: process.env.FIREBASE_API_KEY,
     authDomain: process.env.FIREBASE_AUTH_DOMAIN,
     databaseURL: process.env.FIREBASE_DATABASE_URL,
     projectId: process.env.FIREBASE_PROJECT_ID,
     storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
     messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
     appId: process.env.FIREBASE_APP_ID
   };

   // Initialiser Firebase
   const app = initializeApp(firebaseConfig);
   const auth = getAuth(app);
   const database = getDatabase(app);

   export { app, auth, database };
   