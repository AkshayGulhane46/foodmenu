// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

import {getStorage} from "firebase/storage"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCGu9SQ6jByf45oj_GO9XNj4uz0QOyIJ4A",
  authDomain: "foodmenu-9741a.firebaseapp.com",
  databaseURL: "https://foodmenu-9741a-default-rtdb.firebaseio.com",
  projectId: "foodmenu-9741a",
  storageBucket: "foodmenu-9741a.appspot.com",
  messagingSenderId: "419583161379",
  appId: "1:419583161379:web:5eccad4751c32a3b51ed96"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export firestore database
// It will be imported into your react app whenever it is needed
export const db = getFirestore(app);
export const storage = getStorage(app);