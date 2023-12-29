// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCU5a-suF3kRGXazS88O-abe-1Ze1m1qqU",
  authDomain: "linktree-b1608.firebaseapp.com",
  projectId: "linktree-b1608",
  storageBucket: "linktree-b1608.appspot.com",
  messagingSenderId: "18528096615",
  appId: "1:18528096615:web:966e445368557df37e1fc2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

//Init firestore 
export const firestore = getFirestore(app);


