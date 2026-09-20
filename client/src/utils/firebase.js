
import { initializeApp } from "firebase/app";
import {getAuth, GoogleAuthProvider} from "firebase/auth"
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "mockverse-fdbdb.firebaseapp.com",
  projectId: "mockverse-fdbdb",
  storageBucket: "mockverse-fdbdb.firebasestorage.app",
  messagingSenderId: "146567709560",
  appId: "1:146567709560:web:91a71cd4f88e77696a3e8d"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const provider = new GoogleAuthProvider()

export {auth , provider}

