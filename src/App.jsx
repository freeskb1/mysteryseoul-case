import { useState, useEffect } from 'react'
import { ref, set, get, onValue, push, update, serverTimestamp, off } from 'firebase/database'
import { db, ensureAuth } from './firebase.js'
import { generateRoomCode, distributeCards } from './gameLogic.js'

import weaponsData from './data/weapons.json'
import cluesData from './data/clues.json'
import rolesData from './data/roles.json'

import EntryScreen from './screens/EntryScreen.jsx'
import HostStartScreen from './screens/HostStartScreen.jsx'
import JoinScreen from './screens/JoinScreen.jsx'
import LobbyScreen from './screens/LobbyScreen.jsx'
import PlayerCardScreen from './screens/PlayerCardScreen.jsx'

export default function App() {
  const [user, setUser] = useState(null)
  const [view, setView] = useState('entry') // entry | hostStart | join | lobby | game
  const [roomCode, setRoomCode] = useState(null)
  const [roomData, setRoomData] = useState(null)
  const [error, setError] = useState(null)

  // 익명 로그인
  useEffect(() => {
    ensureAuth()
      .then(setUser)
      .catch((e) => setError('인증 실패: ' + e.message))
  }, [])

  // 방 데이터 실시간 구독
  useEffect(() => {
    if (!roomCode) return
    const roomRef = ref(db, `rooms/${roomCode}`)
    const unsubscribe = onValue(roomRef, (snapshot) => {
      const data = snapshot.val()
      if (!data) {
        setError('방이 존재하지 않거나 종료되었습니다')
        setRoomCode(null)
        setView('entry')
        return
      }
      setRoomData(data)
      // phase에 따라 화면 자동 전환
      if (data.meta?.phase === 'playing') {
        setView('game')
      } else if (data.meta?.phase === 'waiting') {
        setView('lobby')
      }
    })
    return () => off(roomRef)
  }, [roomCode])

  // 호스트: 새 방 생성
  async function handleCreateRoom(nickname) {
    if (!user) return
    setError(null)
    
    // 충돌 없는 코드 생성 (최대 5번 재시도)
    let code = null
    for (let i = 0; i < 5; i++) {
      const candidate = generateRoomCode()
      const snap = await get(ref(db, `rooms/${candidate}`))
      if (!snap.exists()) {
        code = candidate
        break
      }
    }
    if (!code) {
      setError('방 코드 생성 실패. 다시 시도해주세요.')
      return
    }

    // 방 데이터 초기화
    await set(ref(db, `rooms/${code}`), {
      meta: {
        hostId: user.uid,
        phase: 'waiting',
        createdAt: serverTimestamp(),
        options: { accomplice: true, witness: true, difficulty: 4 }
      },
      players: {
        [user.uid]: {
          name: nickname,
          joinedAt: serverTimestamp(),
          isHost: true
        }
      }
    })

    setRoomCode(code)
    setView('lobby')
  }

  // 참여자: 방 입장
  async function handleJoinRoom(code, nickname) {
    if (!user) return
    setError(null)

    const upperCode = code.toUpperCase()
    const snap = await get(ref(db, `rooms/${upperCode}`))
    if (!snap.exists()) {
      setError('해당 사건 코드가 존재하지 않습니다')
      return
    }
    const data = snap.val()
    if (data.meta?.phase !== 'waiting') {
      setError('이미 진행 중인 사건입니다')
      return
    }
    const playerCount = Object.keys(data.players || {}).length
    if (playerCount >= 12) {
      setError('인원이 가득 찼습니다 (최대 12명)')
      return
    }

    // 플레이어 추가
    await update(ref(db, `rooms/${upperCode}/players/${user.uid}`), {
      name: nickname,
      joinedAt: serverTimestamp(),
      isHost: false
    })

    setRoomCode(upperCode)
    setView('lobby')
  }

  // 호스트: 게임 시작
  async function handleStartGame() {
    if (!roomData || !user) return
    if (roomData.meta.hostId !== user.uid) {
      setError('호스트만 게임을 시작할 수 있습니다')
      return
    }
    
    const playerIds = Object.keys(roomData.players)
    if (playerIds.length < 4) {
      setError('최소 4명이 필요합니다')
      return
    }

    const options = roomData.meta.options || { accomplice: true, witness: true, difficulty: 4 }

    // 카드 분배 + 역할 배정
    const distribution = distributeCards(playerIds, {
      weapons: weaponsData,
      clues: cluesData,
      useAccomplice: options.accomplice,
      useWitness: options.witness,
      difficulty: options.difficulty
    })

    // Firebase에 일괄 업데이트
    const updates = {}
    Object.entries(distribution).forEach(([pid, data]) => {
      updates[`rooms/${roomCode}/players/${pid}/role`] = data.role
      updates[`rooms/${roomCode}/players/${pid}/weapons`] = data.weapons
      updates[`rooms/${roomCode}/players/${pid}/clues`] = data.clues
    })
    updates[`rooms/${roomCode}/meta/phase`] = 'playing'
    updates[`rooms/${roomCode}/meta/startedAt`] = serverTimestamp()

    await update(ref(db), updates)
  }

  // 방 나가기
  async function handleLeaveRoom() {
    if (roomCode && user) {
      // (간단한 처리: 일단 그냥 화면 전환만, 실제 게임에선 더 정교한 처리 필요)
      setRoomCode(null)
      setRoomData(null)
      setView('entry')
    }
  }

  // 인증 대기 화면
  if (!user) {
    return (
      <div style={loadingStyle}>
        {error ? <p style={{color:'#E63946'}}>{error}</p> : <p>인증 중...</p>}
      </div>
    )
  }

  // 화면 분기
  return (
    <div>
      {error && (
        <div style={errorBannerStyle}>
          {error}
          <button onClick={() => setError(null)} style={errorCloseStyle}>×</button>
        </div>
      )}
      
      {view === 'entry' && (
        <EntryScreen 
          onSelectHost={() => setView('hostStart')}
          onSelectJoin={() => setView('join')}
        />
      )}
      
      {view === 'hostStart' && (
        <HostStartScreen 
          onCreate={handleCreateRoom}
          onBack={() => setView('entry')}
        />
      )}
      
      {view === 'join' && (
        <JoinScreen 
          onJoin={handleJoinRoom}
          onBack={() => setView('entry')}
        />
      )}
      
      {view === 'lobby' && roomData && (
        <LobbyScreen 
          roomCode={roomCode}
          roomData={roomData}
          currentUserId={user.uid}
          onStartGame={handleStartGame}
          onLeave={handleLeaveRoom}
        />
      )}
      
      {view === 'game' && roomData && (
        <PlayerCardScreen 
          roomData={roomData}
          currentUserId={user.uid}
          rolesData={rolesData}
          onLeave={handleLeaveRoom}
        />
      )}
    </div>
  )
}

const loadingStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  color: '#888780',
  fontSize: 14
}

const errorBannerStyle = {
  position: 'fixed',
  top: 0, left: 0, right: 0,
  background: '#E63946',
  color: '#fff',
  padding: '12px 16px',
  fontSize: 13,
  textAlign: 'center',
  zIndex: 100,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
}

const errorCloseStyle = {
  background: 'transparent',
  border: 'none',
  color: '#fff',
  fontSize: 20,
  cursor: 'pointer',
  padding: '0 8px'
}
