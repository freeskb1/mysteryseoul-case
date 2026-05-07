import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth'

// 사용자님의 Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyDR1G4EtA0MGsODQK3mlw99FBc6KoJ8jtY",
  authDomain: "mysteryseoul-case.firebaseapp.com",
  databaseURL: "https://mysteryseoul-case-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "mysteryseoul-case",
  storageBucket: "mysteryseoul-case.firebasestorage.app",
  messagingSenderId: "755818260264",
  appId: "1:755818260264:web:9526cb8999aefe34d6521d"
}

const app = initializeApp(firebaseConfig)
export const db = getDatabase(app)
export const auth = getAuth(app)

// 익명 로그인 자동 처리
export function ensureAuth() {
  return new Promise((resolve, reject) => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        resolve(user)
      } else {
        signInAnonymously(auth)
          .then((result) => resolve(result.user))
          .catch(reject)
      }
    })
  })
}
