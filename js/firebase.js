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
export const db = getDatabase(app);

// 점수 저장
export function saveScore(name, score) {
  const scoresRef = ref(db, "scores");
  push(scoresRef, { name, score });
}

// 점수 불러오기
export function loadScores(callback) {
  const scoresRef = query(ref(db, "scores"), orderByChild("score"), limitToLast(10));
  onValue(scoresRef, snapshot => {
    let list = [];
    snapshot.forEach(child => {
      list.push(child.val());
    });
    // 높은 점수부터 내림차순
    list.sort((a, b) => b.score - a.score);
    callback(list);
  });
}
