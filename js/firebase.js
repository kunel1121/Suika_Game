// Firebase 초기화
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getDatabase, ref, push, query, orderByChild, limitToLast, onValue } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

const firebaseConfig = {
   apiKey: "AIzaSyCEsD9r_gFZB8A83Cf8nT9B4RGpZB1RK-4",
  authDomain: "handsomeguy-8823a.firebaseapp.com",
  projectId: "handsomeguy-8823a",
  storageBucket: "handsomeguy-8823a.firebasestorage.app",
  messagingSenderId: "1027391807157",
  appId: "1:1027391807157:web:3647a278442f8621b4e8fc",
  measurementId: "G-NYYX0JL8B5"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export function saveScoreToDB(name, score) {
  const scoresRef = ref(db, 'scores');
  return push(scoresRef, { name, score, ts: Date.now() });
}

export function subscribeTopScores(callback, limit = 10) {
  const q = query(ref(db, 'scores'), orderByChild('score'), limitToLast(limit));
  onValue(q, snapshot => {
    const arr = [];
    snapshot.forEach(child => {
      arr.push(child.val());
    });
    arr.sort((a,b)=>b.score-a.score);
    callback(arr);
  });
}
