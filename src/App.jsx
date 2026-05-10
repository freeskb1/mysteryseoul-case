import { useState, useEffect } from 'react'
import { ref, set, get, onValue, update, serverTimestamp, off, remove } from 'firebase/database'
import { db, ensureAuth } from './firebase.js'
import { generateRoomCode, distributeCards } from './gameLogic.js'

import weaponsData from './data/weapons.json'
import cluesData from './data/clues.json'
import rolesData from './data/roles.json'

import EntryScreen from './screens/EntryScreen.jsx'
import HostStartScreen from './screens/HostStartScreen.jsx'
import JoinScreen from './screens/JoinScreen.jsx'
import BrokerJoinScreen from './screens/BrokerJoinScreen.jsx'
import LobbyScreen from './screens/LobbyScreen.jsx'
import PlayerCardScreen from './screens/PlayerCardScreen.jsx'
import BrokerBoardScreen from './screens/BrokerBoardScreen.jsx'
import MurdererChooseScreen from './screens/MurdererChooseScreen.jsx'
import AccompliceRevealScreen from './screens/AccompliceRevealScreen.jsx'
import WitnessRevealScreen from './screens/WitnessRevealScreen.jsx'
import ForensicTakeoverScreen from './screens/ForensicTakeoverScreen.jsx'
import WaitingScreen from './screens/WaitingScreen.jsx'
import ForensicProgressGuide from './screens/ForensicProgressGuide.jsx'

export default function App() {
  const [user, setUser] = useState(null)
  const [view, setView] = useState('entry')
  const [roomCode, setRoomCode] = useState(null)
  const [roomData, setRoomData] = useState(null)
  const [error, setError] = useState(null)
  const [deviceType, setDeviceType] = useState(null)

  useEffect(() => {
    ensureAuth()
      .then(setUser)
      .catch((e) => setError('인증 실패: ' + e.message))
  }, [])

  useEffect(() => {
    if (!roomCode) return
    const roomRef = ref(db, `rooms/${roomCode}`)
    const unsubscribe = onValue(roomRef, (snapshot) => {
      const data = snapshot.val()
      if (!data) {
        setError('방이 존재하지 않거나 종료되었습니다')
        setRoomCode(null)
        setRoomData(null)
        setDeviceType(null)
        setView('entry')
        return
      }
      setRoomData(data)
      
      const phase = data.meta?.phase
      if (phase === 'waiting') {
        setView('lobby')
      } else if (['murderer_choosing', 'accomplice_reveal', 'witness_reveal', 'forensic_setup', 'playing'].includes(phase)) {
        setView('game')
      }
    })
    return () => off(roomRef)
  }, [roomCode])

  async function handleCreateRoom(nickname) {
    if (!user) return
    setError(null)
    
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

    await set(ref(db, `rooms/${code}`), {
      meta: {
        hostId: user.uid,
        phase: 'waiting',
        createdAt: serverTimestamp(),
        options: { accomplice: true, witness: true, difficulty: 4 },
        brokerDeviceId: null,
        forensicTookOver: false,
        murdererId: null,
        accompliceConfirmed: false,
        witnessConfirmed: false
      },
      players: {
        [user.uid]: {
          name: nickname,
          joinedAt: serverTimestamp(),
          isHost: true
        }
      }
    })

    setDeviceType('player')
    setRoomCode(code)
    setView('lobby')
  }

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

    await update(ref(db, `rooms/${upperCode}/players/${user.uid}`), {
      name: nickname,
      joinedAt: serverTimestamp(),
      isHost: false
    })

    setDeviceType('player')
    setRoomCode(upperCode)
    setView('lobby')
  }

  async function handleBrokerJoin(code) {
    if (!user) return
    setError(null)

    const upperCode = code.toUpperCase()
    const snap = await get(ref(db, `rooms/${upperCode}`))
    if (!snap.exists()) {
      setError('해당 사건 코드가 존재하지 않습니다')
      return
    }
    const data = snap.val()
    
    if (data.meta?.brokerDeviceId && data.meta.brokerDeviceId !== user.uid) {
      setError('이미 다른 큰 화면이 등록되어 있습니다')
      return
    }

    // 만약 같은 user.uid가 players에 있으면 제거 (이전에 플레이어로 들어갔던 경우 잔상 방지)
    if (data.players && data.players[user.uid]) {
      await remove(ref(db, `rooms/${upperCode}/players/${user.uid}`))
    }

    await update(ref(db, `rooms/${upperCode}/meta`), {
      brokerDeviceId: user.uid
    })

    setDeviceType('broker')
    setRoomCode(upperCode)
    setView('lobby')
  }

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

    const distribution = distributeCards(playerIds, {
      weapons: weaponsData,
      clues: cluesData,
      useAccomplice: options.accomplice,
      useWitness: options.witness,
      difficulty: options.difficulty
    })

    let murdererId = null
    Object.entries(distribution).forEach(([pid, data]) => {
      if (data.role === 'murderer') {
        murdererId = pid
      }
    })

    const updates = {}
    Object.entries(distribution).forEach(([pid, data]) => {
      updates[`rooms/${roomCode}/players/${pid}/role`] = data.role
      updates[`rooms/${roomCode}/players/${pid}/weapons`] = data.weapons
      updates[`rooms/${roomCode}/players/${pid}/clues`] = data.clues
    })
    updates[`rooms/${roomCode}/meta/phase`] = 'murderer_choosing'
    updates[`rooms/${roomCode}/meta/startedAt`] = serverTimestamp()
    updates[`rooms/${roomCode}/meta/murdererId`] = murdererId

    await update(ref(db), updates)
  }

  async function handleMurdererConfirm(weapon, clue) {
    if (!roomData || !user) return
    if (roomData.meta.murdererId !== user.uid) return

    await update(ref(db, `rooms/${roomCode}/players/${user.uid}`), {
      chosenWeapon: weapon,
      chosenClue: clue
    })
    
    const players = roomData.players
    const hasAccomplice = Object.values(players).some(p => p.role === 'accomplice')
    const hasWitness = Object.values(players).some(p => p.role === 'witness')
    
    let nextPhase = 'forensic_setup'
    if (hasAccomplice) {
      nextPhase = 'accomplice_reveal'
    } else if (hasWitness) {
      nextPhase = 'witness_reveal'
    }
    
    await update(ref(db, `rooms/${roomCode}/meta`), {
      phase: nextPhase
    })
  }

  async function handleAccompliceConfirm() {
    if (!roomData || !user) return
    const me = roomData.players[user.uid]
    if (me?.role !== 'accomplice') return

    const players = roomData.players
    const hasWitness = Object.values(players).some(p => p.role === 'witness')
    
    const nextPhase = hasWitness ? 'witness_reveal' : 'forensic_setup'
    
    await update(ref(db, `rooms/${roomCode}/meta`), {
      accompliceConfirmed: true,
      phase: nextPhase
    })
  }

  async function handleWitnessConfirm() {
    if (!roomData || !user) return
    const me = roomData.players[user.uid]
    if (me?.role !== 'witness') return

    await update(ref(db, `rooms/${roomCode}/meta`), {
      witnessConfirmed: true,
      phase: 'forensic_setup'
    })
  }

  async function handleForensicTakeover() {
    if (!roomData || !user) return
    const me = roomData.players[user.uid]
    if (me?.role !== 'forensic') return

    await update(ref(db, `rooms/${roomCode}/meta`), {
      phase: 'playing',
      forensicTookOver: true
    })
  }

  // 방 나가기 - Firebase 정리
  async function handleLeaveRoom() {
    if (!roomCode || !user) return
    
    try {
      if (deviceType === 'broker') {
        // 큰 화면 해제
        if (roomData?.meta?.brokerDeviceId === user.uid) {
          await update(ref(db, `rooms/${roomCode}/meta`), {
            brokerDeviceId: null
          })
        }
      } else {
        // 플레이어 — 호스트면 방 자체 폐쇄, 아니면 자기만 제거
        const isHost = roomData?.players?.[user.uid]?.isHost
        if (isHost) {
          // 호스트가 나가면 방 폐쇄 (다른 모든 사람도 튕김)
          await remove(ref(db, `rooms/${roomCode}`))
        } else {
          // 자기 정보만 삭제
          await remove(ref(db, `rooms/${roomCode}/players/${user.uid}`))
        }
      }
    } catch (e) {
      console.error('방 나가기 실패:', e)
    }
    
    setRoomCode(null)
    setRoomData(null)
    setDeviceType(null)
    setView('entry')
  }

  if (!user) {
    return (
      <div style={loadingStyle}>
        {error ? <p style={{color:'#E63946'}}>{error}</p> : <p>인증 중...</p>}
      </div>
    )
  }

  const errorBanner = error && (
    <div style={errorBannerStyle}>
      {error}
      <button onClick={() => setError(null)} style={errorCloseStyle}>×</button>
    </div>
  )

  if (view === 'entry') {
    return (
      <div>
        {errorBanner}
        <EntryScreen 
          onSelectHost={() => setView('hostStart')}
          onSelectJoin={() => setView('join')}
          onSelectBroker={() => setView('brokerJoin')}
        />
      </div>
    )
  }
  if (view === 'hostStart') {
    return (
      <div>
        {errorBanner}
        <HostStartScreen 
          onCreate={handleCreateRoom}
          onBack={() => setView('entry')}
        />
      </div>
    )
  }
  if (view === 'join') {
    return (
      <div>
        {errorBanner}
        <JoinScreen 
          onJoin={handleJoinRoom}
          onBack={() => setView('entry')}
        />
      </div>
    )
  }
  if (view === 'brokerJoin') {
    return (
      <div>
        {errorBanner}
        <BrokerJoinScreen 
          onJoin={handleBrokerJoin}
          onBack={() => setView('entry')}
        />
      </div>
    )
  }

  if (!roomData) {
    return (
      <div>
        {errorBanner}
        <div style={loadingStyle}><p>방 데이터 로드 중...</p></div>
      </div>
    )
  }

  if (deviceType === 'broker') {
    return (
      <div>
        {errorBanner}
        <BrokerBoardScreen
          roomCode={roomCode}
          roomData={roomData}
          rolesData={rolesData}
          onLeave={handleLeaveRoom}
        />
      </div>
    )
  }

  if (view === 'lobby') {
    return (
      <div>
        {errorBanner}
        <LobbyScreen 
          roomCode={roomCode}
          roomData={roomData}
          currentUserId={user.uid}
          onStartGame={handleStartGame}
          onLeave={handleLeaveRoom}
        />
      </div>
    )
  }

  const phase = roomData.meta?.phase
  const me = roomData.players?.[user.uid]
  const isMurderer = me?.role === 'murderer'
  const isAccomplice = me?.role === 'accomplice'
  const isWitness = me?.role === 'witness'
  const isForensic = me?.role === 'forensic'
  const murdererId = roomData.meta?.murdererId
  const murderer = murdererId ? roomData.players[murdererId] : null

  // 1. 살인자 카드 선택 단계
  if (phase === 'murderer_choosing') {
    if (isMurderer && !me.chosenWeapon) {
      return (
        <div>
          {errorBanner}
          <MurdererChooseScreen 
            me={me}
            onConfirm={handleMurdererConfirm}
          />
        </div>
      )
    }
    // 법의학자에게는 진행자 가이드 표시
    if (isForensic) {
      return (
        <div>
          {errorBanner}
          <ForensicProgressGuide
            phase="murderer_choosing"
            roomData={roomData}
          />
        </div>
      )
    }
    return (
      <div>
        {errorBanner}
        <WaitingScreen 
          icon="🔪"
          message="살인자가 범행을 결정하는 중..."
          subMessage="잠시 기다려 주세요"
        />
      </div>
    )
  }

  // 2. 공범자 노출 단계
  if (phase === 'accomplice_reveal') {
    if (isAccomplice) {
      return (
        <div>
          {errorBanner}
          <AccompliceRevealScreen
            me={me}
            murderer={murderer}
            onConfirm={handleAccompliceConfirm}
          />
        </div>
      )
    }
    if (isForensic) {
      return (
        <div>
          {errorBanner}
          <ForensicProgressGuide
            phase="accomplice_reveal"
            roomData={roomData}
          />
        </div>
      )
    }
    return (
      <div>
        {errorBanner}
        <WaitingScreen 
          icon="🤝"
          message="공범자가 정보를 확인하는 중..."
          subMessage="잠시 기다려 주세요"
        />
      </div>
    )
  }

  // 3. 목격자 노출 단계
  if (phase === 'witness_reveal') {
    if (isWitness) {
      const candidates = []
      Object.entries(roomData.players || {}).forEach(([uid, p]) => {
        if (p.role === 'murderer' || p.role === 'accomplice') {
          candidates.push({ uid, ...p })
        }
      })
      const shuffled = [...candidates].sort(() => Math.random() - 0.5)
      
      return (
        <div>
          {errorBanner}
          <WitnessRevealScreen
            candidates={shuffled}
            onConfirm={handleWitnessConfirm}
          />
        </div>
      )
    }
    if (isForensic) {
      return (
        <div>
          {errorBanner}
          <ForensicProgressGuide
            phase="witness_reveal"
            roomData={roomData}
          />
        </div>
      )
    }
    return (
      <div>
        {errorBanner}
        <WaitingScreen 
          icon="👁"
          message="목격자가 후보를 확인하는 중..."
          subMessage="잠시 기다려 주세요"
        />
      </div>
    )
  }

  // 4. 법의학자 콘솔 인계
  if (phase === 'forensic_setup') {
    if (isForensic) {
      return (
        <div>
          {errorBanner}
          <ForensicTakeoverScreen onTakeover={handleForensicTakeover} />
        </div>
      )
    }
    return (
      <div>
        {errorBanner}
        <WaitingScreen 
          icon="🔬"
          message="법의학자가 콘솔 인계 중..."
          subMessage="잠시 기다려 주세요"
        />
      </div>
    )
  }

  // 5. 본 게임
  if (phase === 'playing') {
    return (
      <div>
        {errorBanner}
        <PlayerCardScreen 
          roomData={roomData}
          currentUserId={user.uid}
          rolesData={rolesData}
          onLeave={handleLeaveRoom}
        />
      </div>
    )
  }

  return (
    <div>
      {errorBanner}
      <div style={loadingStyle}><p>알 수 없는 상태: {phase}</p></div>
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
