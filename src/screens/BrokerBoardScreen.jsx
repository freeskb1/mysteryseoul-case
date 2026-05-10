import { useState, useEffect } from 'react'
import tilesData from '../data/tiles.json'

export default function BrokerBoardScreen({ roomCode, roomData, rolesData }) {
  const meta = roomData.meta || {}
  const phase = meta.phase
  const players = roomData.players || {}
  const playerList = Object.entries(players).map(([uid, p]) => ({ uid, ...p }))

  // 대기실 상태일 때
  if (phase === 'waiting') {
    return (
      <div style={s.wrap}>
        <div style={s.lobbyBoard}>
          <div style={s.lobbyHeader}>
            <p style={s.brand}>SEOUL COLD CASE</p>
            <p style={s.lobbyTitle}>사건 #{roomCode} — 대기 중</p>
          </div>
          
          <div style={s.lobbyCenter}>
            <div style={s.codeDisplay}>
              <p style={s.codeLabel}>사건 코드</p>
              <p style={s.codeValue}>{roomCode}</p>
              <p style={s.codeHint}>친구들에게 이 코드를 공유하세요</p>
            </div>

            <div style={s.lobbyPlayers}>
              <p style={s.playerCountLabel}>참가자 ({playerList.length}/12)</p>
              <div style={s.playerChips}>
                {playerList.map(p => (
                  <span 
                    key={p.uid}
                    style={{
                      ...s.playerChip,
                      ...(p.isHost ? s.playerChipHost : {})
                    }}
                  >
                    {p.name}
                    {p.isHost && ' ★'}
                  </span>
                ))}
                {playerList.length < 4 && (
                  <span style={s.waitingChip}>
                    {4 - playerList.length}명 더 필요
                  </span>
                )}
              </div>
            </div>
          </div>

          <p style={s.lobbyFooter}>호스트가 게임을 시작하기를 기다리는 중...</p>
        </div>
      </div>
    )
  }

  // 게임 진행 중 — 메인 보드
  if (phase === 'playing' || phase === 'murderer_choosing' || phase === 'forensic_setup') {
    return <GameBoard roomCode={roomCode} roomData={roomData} rolesData={rolesData} playerList={playerList} />
  }

  // 기본 안내
  return (
    <div style={s.wrap}>
      <div style={{textAlign: 'center', padding: 60}}>
        <p style={{color: '#888780'}}>알 수 없는 게임 상태: {phase}</p>
      </div>
    </div>
  )
}

function GameBoard({ roomCode, roomData, rolesData, playerList }) {
  const meta = roomData.meta || {}
  const board = roomData.publicBoard || {}
  const phase = meta.phase

  // 게임 시작 직후 살인자 선택 단계
  if (phase === 'murderer_choosing') {
    return (
      <div style={s.wrap}>
        <div style={s.boardPhase}>
          <div style={s.phaseHeader}>
            <p style={s.brand}>CASE #{roomCode}</p>
            <p style={s.phaseTitle}>🔍 사건 시작</p>
          </div>
          
          <div style={s.phaseBody}>
            <div style={s.phaseIcon}>🔪</div>
            <p style={s.phaseMain}>살인자가 범행을 결정하는 중...</p>
            <p style={s.phaseSub}>잠시 기다려 주세요</p>
            <div style={s.spinner}></div>
          </div>

          <div style={s.phaseFooter}>
            <p style={s.phaseGuide}>법의학자가 곧 콘솔을 인계받습니다</p>
          </div>
        </div>
      </div>
    )
  }

  // 법의학자 콘솔 인계 대기 단계
  if (phase === 'forensic_setup') {
    return (
      <div style={s.wrap}>
        <div style={s.boardPhase}>
          <div style={s.phaseHeader}>
            <p style={s.brand}>CASE #{roomCode}</p>
            <p style={s.phaseTitle}>🔬 법의학자 대기 중</p>
          </div>

          <div style={s.phaseBody}>
            <div style={s.phaseIcon}>🔬</div>
            <p style={s.phaseMain}>법의학자의 콘솔 인계를 대기 중입니다</p>
            <p style={s.phaseSub}>법의학자가 자기 폰에서 "🔬 제가 법의학자입니다" 버튼을 누르면 진행됩니다</p>
          </div>
        </div>
      </div>
    )
  }

  // 메인 보드 (실제 게임 진행) — MVP 2-A에선 placeholder, 2-B에서 완성
  return (
    <div style={s.wrap}>
      <div style={s.mainBoard}>
        <div style={s.boardHeader}>
          <div>
            <span style={s.boardCase}>CASE</span>
            <span style={s.boardCode}>#{roomCode}</span>
          </div>
          <div style={s.boardRound}>
            <span style={s.roundBadge}>라운드 {meta.currentRound || 1} / 3</span>
          </div>
        </div>

        <div style={s.tilesGrid}>
          <PlaceholderTile category="사망 원인" fixed />
          <PlaceholderTile category="범죄 장소" fixed />
          <PlaceholderTile category="(타일 4)" />
          <PlaceholderTile category="(타일 5)" />
          <PlaceholderTile category="(타일 6)" />
          <PlaceholderTile category="(타일 7)" />
        </div>

        <div style={s.playerRow}>
          {playerList.map(p => (
            <span key={p.uid} style={s.playerTag}>{p.name}</span>
          ))}
        </div>

        <div style={s.placeholderNotice}>
          ⚠️ MVP 2-A 단계: 마커 배치, 라운드 진행 등은 2-B에서 추가됩니다
        </div>
      </div>
    </div>
  )
}

function PlaceholderTile({ category, fixed }) {
  return (
    <div style={{
      ...s.tile,
      ...(fixed ? s.tileFixed : {})
    }}>
      <p style={{
        ...s.tileTitle,
        color: fixed ? '#FFE600' : '#F4E8D0'
      }}>
        {category} {fixed && '⭐'}
      </p>
      <div style={s.tileOptions}>
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} style={s.tileOption}>옵션 {i}</div>
        ))}
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
    padding: 16
  },

  // 대기실 보드
  lobbyBoard: {
    width: '100%',
    maxWidth: 1400,
    aspectRatio: '1180 / 820',
    background: '#1A2332',
    border: '0.5px solid rgba(244, 232, 208, 0.15)',
    borderRadius: 12,
    padding: 24,
    display: 'flex',
    flexDirection: 'column',
    gap: 16
  },
  lobbyHeader: {
    textAlign: 'center',
    paddingBottom: 16,
    borderBottom: '0.5px solid rgba(244, 232, 208, 0.15)'
  },
  brand: {
    fontSize: 12,
    letterSpacing: 4,
    color: '#FFE600',
    margin: 0
  },
  lobbyTitle: {
    fontSize: 22,
    fontWeight: 500,
    margin: '8px 0 0',
    color: '#F4E8D0'
  },
  lobbyCenter: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 32,
    alignItems: 'center'
  },
  codeDisplay: {
    textAlign: 'center'
  },
  codeLabel: {
    fontSize: 13,
    color: '#888780',
    letterSpacing: 2,
    margin: '0 0 12px'
  },
  codeValue: {
    fontSize: 86,
    fontWeight: 500,
    color: '#FFE600',
    letterSpacing: 18,
    margin: 0,
    fontFamily: 'monospace'
  },
  codeHint: {
    fontSize: 13,
    color: '#888780',
    margin: '12px 0 0'
  },
  lobbyPlayers: {
    width: '100%',
    maxWidth: 700,
    textAlign: 'center'
  },
  playerCountLabel: {
    fontSize: 13,
    color: '#888780',
    letterSpacing: 1,
    margin: '0 0 12px'
  },
  playerChips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center'
  },
  playerChip: {
    background: '#2C2C2A',
    color: '#F4E8D0',
    padding: '8px 16px',
    borderRadius: 6,
    fontSize: 14
  },
  playerChipHost: {
    background: 'rgba(255, 230, 0, 0.1)',
    border: '0.5px solid rgba(255, 230, 0, 0.4)',
    color: '#FFE600'
  },
  waitingChip: {
    background: 'rgba(244, 232, 208, 0.03)',
    border: '0.5px dashed rgba(244, 232, 208, 0.2)',
    color: '#888780',
    padding: '8px 16px',
    borderRadius: 6,
    fontSize: 13
  },
  lobbyFooter: {
    textAlign: 'center',
    fontSize: 13,
    color: '#888780',
    margin: 0,
    paddingTop: 12,
    borderTop: '0.5px solid rgba(244, 232, 208, 0.1)'
  },

  // 단계별 화면
  boardPhase: {
    width: '100%',
    maxWidth: 1400,
    aspectRatio: '1180 / 820',
    background: '#1A2332',
    border: '0.5px solid rgba(244, 232, 208, 0.15)',
    borderRadius: 12,
    padding: 24,
    display: 'flex',
    flexDirection: 'column'
  },
  phaseHeader: {
    paddingBottom: 16,
    borderBottom: '0.5px solid rgba(244, 232, 208, 0.15)',
    textAlign: 'center'
  },
  phaseTitle: {
    fontSize: 24,
    fontWeight: 500,
    margin: '8px 0 0',
    color: '#F4E8D0'
  },
  phaseBody: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16
  },
  phaseIcon: {
    fontSize: 80
  },
  phaseMain: {
    fontSize: 22,
    color: '#F4E8D0',
    margin: 0
  },
  phaseSub: {
    fontSize: 14,
    color: '#888780',
    margin: 0
  },
  spinner: {
    width: 32,
    height: 32,
    border: '3px solid rgba(255, 230, 0, 0.2)',
    borderTopColor: '#FFE600',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginTop: 16
  },
  phaseFooter: {
    textAlign: 'center',
    paddingTop: 16,
    borderTop: '0.5px solid rgba(244, 232, 208, 0.1)'
  },
  phaseGuide: {
    fontSize: 13,
    color: '#888780',
    margin: 0
  },

  // 메인 보드
  mainBoard: {
    width: '100%',
    maxWidth: 1400,
    aspectRatio: '1180 / 820',
    background: '#1A2332',
    border: '0.5px solid rgba(244, 232, 208, 0.15)',
    borderRadius: 12,
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    color: '#F4E8D0'
  },
  boardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  boardCase: {
    fontSize: 11,
    color: '#888780',
    letterSpacing: 2,
    marginRight: 12
  },
  boardCode: {
    fontSize: 16,
    fontWeight: 500
  },
  roundBadge: {
    background: '#FFE600',
    color: '#1A2332',
    padding: '4px 12px',
    borderRadius: 4,
    fontSize: 13,
    fontWeight: 500
  },
  tilesGrid: {
    flex: 1,
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: 10
  },
  tile: {
    background: '#2C2C2A',
    border: '0.5px solid rgba(244, 232, 208, 0.15)',
    borderRadius: 8,
    padding: 12,
    display: 'flex',
    flexDirection: 'column'
  },
  tileFixed: {
    border: '0.5px solid rgba(255, 230, 0, 0.3)'
  },
  tileTitle: {
    fontSize: 13,
    fontWeight: 500,
    margin: '0 0 10px',
    textAlign: 'center'
  },
  tileOptions: {
    display: 'flex',
    flexDirection: 'column',
    gap: 5,
    flex: 1,
    justifyContent: 'center'
  },
  tileOption: {
    padding: '6px 4px',
    color: '#888780',
    fontSize: 12,
    textAlign: 'center'
  },
  playerRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
    padding: '4px 0'
  },
  playerTag: {
    background: '#2C2C2A',
    color: '#F4E8D0',
    padding: '4px 10px',
    borderRadius: 4,
    fontSize: 12
  },
  placeholderNotice: {
    background: 'rgba(255, 230, 0, 0.05)',
    border: '0.5px dashed rgba(255, 230, 0, 0.3)',
    borderRadius: 6,
    padding: '8px 14px',
    fontSize: 12,
    color: '#888780',
    textAlign: 'center'
  }
}

// CSS 애니메이션 추가
if (typeof document !== 'undefined' && !document.getElementById('broker-animations')) {
  const style = document.createElement('style')
  style.id = 'broker-animations'
  style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }'
  document.head.appendChild(style)
}
