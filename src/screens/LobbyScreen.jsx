export default function LobbyScreen({ roomCode, roomData, currentUserId, onStartGame, onLeave }) {
  const players = roomData.players || {}
  const playerList = Object.entries(players).map(([uid, p]) => ({ uid, ...p }))
  const isHost = roomData.meta?.hostId === currentUserId
  const playerCount = playerList.length

  function copyCode() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(roomCode)
        .then(() => alert(`코드 ${roomCode} 복사됨`))
        .catch(() => {})
    }
  }

  return (
    <div style={s.wrap}>
      <div style={s.phone}>
        <div style={s.header}>
          <p style={s.brand}>CASE FILE</p>
          <p style={s.code} onClick={copyCode}>
            {roomCode} <span style={s.copyHint}>(탭하여 복사)</span>
          </p>
          <p style={s.guide}>코드를 친구들에게 공유하세요</p>
        </div>

        <div style={s.section}>
          <div style={s.sectionHeader}>
            <span>참가자 ({playerCount}/12)</span>
            <span style={s.statusOk}>● 연결됨</span>
          </div>
          <div style={s.playerList}>
            {playerList.map(p => (
              <div 
                key={p.uid}
                style={{
                  ...s.playerItem,
                  ...(p.uid === currentUserId ? s.playerItemSelf : {})
                }}
              >
                <span style={s.playerName}>
                  {p.name}
                  {p.uid === currentUserId && <span style={s.youTag}> (나)</span>}
                </span>
                {p.isHost && <span style={s.hostBadge}>호스트</span>}
              </div>
            ))}
            {playerCount < 4 && (
              <div style={s.waitingBox}>
                최소 4명이 필요합니다 ({4 - playerCount}명 더 필요)
              </div>
            )}
          </div>
        </div>

        <div style={s.bottomArea}>
          {isHost ? (
            <button
              onClick={onStartGame}
              disabled={playerCount < 4}
              style={{
                ...s.primaryBtn,
                opacity: playerCount < 4 ? 0.4 : 1,
                cursor: playerCount < 4 ? 'not-allowed' : 'pointer'
              }}
            >
              ▶ 사건 시작 (카드 분배)
            </button>
          ) : (
            <div style={s.waitMsg}>
              호스트가 게임을 시작하기를 기다리는 중...
            </div>
          )}
          <button onClick={onLeave} style={s.secondaryBtn}>
            방 나가기
          </button>
        </div>
      </div>
    </div>
  )
}

const s = {
  wrap: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
  phone: {
    width: '100%',
    maxWidth: 360,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    minHeight: 600,
    padding: 20,
    boxSizing: 'border-box'
  },
  header: {
    textAlign: 'center',
    paddingBottom: 16,
    borderBottom: '0.5px solid rgba(244, 232, 208, 0.15)'
  },
  brand: {
    fontSize: 11,
    letterSpacing: 2,
    color: '#888780',
    margin: 0
  },
  code: {
    fontSize: 36,
    fontWeight: 500,
    color: '#FFE600',
    letterSpacing: 8,
    margin: '8px 0 4px',
    cursor: 'pointer',
    userSelect: 'all'
  },
  copyHint: {
    fontSize: 10,
    color: '#888780',
    letterSpacing: 0,
    fontWeight: 400
  },
  guide: {
    fontSize: 11,
    color: '#888780',
    margin: 0
  },
  section: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 10
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: 12,
    color: '#888780',
    letterSpacing: 1
  },
  statusOk: {
    color: '#5DCAA5',
    fontSize: 11
  },
  playerList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    maxHeight: 280,
    overflowY: 'auto'
  },
  playerItem: {
    background: '#2C2C2A',
    borderRadius: 6,
    padding: '11px 14px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  playerItemSelf: {
    background: 'rgba(255, 230, 0, 0.08)',
    border: '0.5px solid rgba(255, 230, 0, 0.3)'
  },
  playerName: {
    fontSize: 14,
    color: '#F4E8D0'
  },
  youTag: {
    fontSize: 11,
    color: '#FFE600',
    fontWeight: 500
  },
  hostBadge: {
    background: '#FFE600',
    color: '#1A2332',
    fontSize: 10,
    padding: '2px 8px',
    borderRadius: 3,
    fontWeight: 500
  },
  waitingBox: {
    background: 'rgba(244, 232, 208, 0.03)',
    border: '0.5px dashed rgba(244, 232, 208, 0.2)',
    borderRadius: 6,
    padding: '14px',
    textAlign: 'center',
    fontSize: 12,
    color: '#888780'
  },
  bottomArea: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8
  },
  primaryBtn: {
    background: '#FFE600',
    color: '#1A2332',
    border: 'none',
    padding: 16,
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 500
  },
  secondaryBtn: {
    background: 'transparent',
    color: '#888780',
    border: '0.5px solid rgba(244, 232, 208, 0.2)',
    padding: 12,
    borderRadius: 8,
    fontSize: 12,
    cursor: 'pointer'
  },
  waitMsg: {
    background: 'rgba(255, 230, 0, 0.05)',
    border: '0.5px solid rgba(255, 230, 0, 0.2)',
    borderRadius: 8,
    padding: 16,
    textAlign: 'center',
    fontSize: 13,
    color: '#F4E8D0'
  }
}
