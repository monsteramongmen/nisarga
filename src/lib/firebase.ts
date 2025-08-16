// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "catering-commander-uknz9",
  "appId": "1:537603298047:web:f31457f1ab2945e09172ca",
  "storageBucket": "catering-commander-uknz9.firebasestorage.app",
  "apiKey": "AIzaSyBauXQLKPO9hhZjbbkDeTWKprFZQ2Ezw1o",
  "authDomain": "catering-commander-uknz9.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "537603298047"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
