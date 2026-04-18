import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC1E_1w6sCO9DlKG_ZVzHYWREIQcU-BoPk",
  authDomain: "prompt-wars-flowsync.firebaseapp.com",
  projectId: "prompt-wars-flowsync",
  storageBucket: "prompt-wars-flowsync.firebasestorage.app",
  messagingSenderId: "958068462558",
  appId: "1:958068462558:web:b19decf33f0afcfeccc34f"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
