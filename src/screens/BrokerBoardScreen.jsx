import { useState, useEffect } from 'react'

export default function BrokerBoardScreen({ roomCode, roomData, rolesData }) {
  const meta = roomData.meta || {}
  const phase = meta.phase
  const players = roomData.players || {}
  const playerList = Object.entries(players).map(([uid, p]) => ({ uid, ...p }))

  // 대기실
  if (phase === 'waiting') {
    return <LobbyBoard roomCode={roomCode} playerList={playerList} />
  }

  // 살인자 카드 선택
  if (phase === 'murderer_choosing') {
    return <MurdererChoosingBoard roomCode={roomCode} />
  }

  // 공범자 노출 (NEW)
  if (phase === 'accomplice_reveal') {
    return <AccompliceRevealBoard roomCode={roomCode} playerList={playerList} players={players} />
  }

  // 목격자 노출 (NEW)
  if (phase === 'witness_reveal') {
    return <WitnessRevealBoard roomCode={roomCode} playerList={playerList} players={players} />
  }

  // 법의학자 콘솔 인계 대기
  if (phase === 'forensic_setup') {
    return <ForensicSetupBoard roomCode={roomCode} />
  }

  // 본격 게임
  if (phase === 'playing') {
    return <PlayingBoard roomCode={roomCode} roomData={roomData} rolesData={rolesData} playerList={playerList} />
  }

  return (
    <div style={s.wrap}>
      <div style={{textAlign: 'center', padding: 60, color: '#888780'}}>
        알 수 없는 게임 상태: {phase}
      </div>
    </div>
  )
}

// ============ 1. 대기실 보드 ============
function LobbyBoard({ roomCode, playerList }) {
  return (
    <div style={s.wrap}>
      <div style={s.board}>
        <div style={s.headerCenter}>
          <p style={s.brand}>SEOUL COLD CASE</p>
          <p style={s.title}>사건 #{roomCode} — 대기 중</p>
        </div>
        
        <div style={s.body}>
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

        <p style={s.footerCenter}>호스트가 게임을 시작하기를 기다리는 중...</p>
      </div>
    </div>
  )
}

// ============ 2. 살인자 카드 선택 단계 ============
function MurdererChoosingBoard({ roomCode }) {
  return (
    <StageBoard
      step="STEP 1"
      stepColor="#E63946"
      title="모두 눈을 감으세요"
      mainBanner="🔪 살인범만 눈을 뜨세요"
      mainColor="#E63946"
      mainBg="rgba(230, 57, 70, 0.12)"
      mainBorder="rgba(230, 57, 70, 0.4)"
      subText={
        <>살인범은 본인 폰에서<br/>
        <strong style={{color: '#FFE600'}}>범행에 사용한 사인 1장 + 단서 1장</strong>을 선택해주세요</>
      }
      progressText="살인범이 범행을 결정하는 중..."
      audienceText="고개를 숙이고 폰을 가려주세요"
      roomCode={roomCode}
    />
  )
}

// ============ 3. 공범자 노출 단계 (NEW) ============
function AccompliceRevealBoard({ roomCode, playerList, players }) {
  // 공범자가 있는지 확인
  const accomplice = Object.values(players).find(p => p.role === 'accomplice')
  
  return (
    <StageBoard
      step="STEP 2"
      stepColor="#C97A4A"
      title="공범자만 눈을 뜨세요"
      mainBanner="🤝 공범자, 진실을 확인하세요"
      mainColor="#C97A4A"
      mainBg="rgba(133, 79, 11, 0.18)"
      mainBorder="rgba(201, 122, 74, 0.4)"
      subText={
        <>당신의 폰에 살인자 + 사인 + 단서가 표시됩니다<br/>
        <strong style={{color: '#FFE600'}}>잘 외워두고 살인자를 도우세요</strong></>
      }
      progressText={accomplice ? `${accomplice.name}이(가) 확인 중...` : '공범자가 확인 중...'}
      audienceText="고개를 숙이고 폰을 가려주세요"
      roomCode={roomCode}
    />
  )
}

// ============ 4. 목격자 노출 단계 (NEW) ============
function WitnessRevealBoard({ roomCode, playerList, players }) {
  const witness = Object.values(players).find(p => p.role === 'witness')
  
  return (
    <StageBoard
      step="STEP 3"
      stepColor="#AFA9EC"
      title="목격자만 눈을 뜨세요"
      mainBanner="👁 목격자, 후보를 확인하세요"
      mainColor="#AFA9EC"
      mainBg="rgba(60, 52, 137, 0.2)"
      mainBorder="rgba(175, 169, 236, 0.4)"
      subText={
        <>당신의 폰에 살인자/공범자 후보가 표시됩니다<br/>
        <strong style={{color: '#FFE600'}}>누가 누군지는 모릅니다 — 직접 알아내야 합니다</strong></>
      }
      progressText={witness ? `${witness.name}이(가) 확인 중...` : '목격자가 확인 중...'}
      audienceText="고개를 숙이고 폰을 가려주세요"
      roomCode={roomCode}
    />
  )
}

// ============ 5. 법의학자 인계 대기 단계 ============
function ForensicSetupBoard({ roomCode }) {
  return (
    <StageBoard
      step="STEP 4"
      stepColor="#5DCAA5"
      title="법의학자가 콘솔을 인계받습니다"
      mainBanner="🔬 법의학자, 앞으로 나오세요"
      mainColor="#5DCAA5"
      mainBg="rgba(15, 110, 86, 0.15)"
      mainBorder="rgba(93, 202, 165, 0.4)"
      subText={
        <>본인 폰에서 <strong style={{color: '#5DCAA5'}}>"제가 법의학자입니다"</strong> 버튼을 누르면<br/>
        이 화면이 콘솔 모드로 전환됩니다</>
      }
      progressText="법의학자 인계 대기 중..."
      audienceText="잠시 후 수사가 시작됩니다"
      roomCode={roomCode}
    />
  )
}

// ============ 공통 단계 안내 컴포넌트 ============
function StageBoard({ step, stepColor, title, mainBanner, mainColor, mainBg, mainBorder, subText, progressText, audienceText, roomCode }) {
  const [pulse, setPulse] = useState(true)
  
  useEffect(() => {
    const t = setInterval(() => setPulse(p => !p), 1500)
    return () => clearInterval(t)
  }, [])

  return (
    <div style={s.wrap}>
      <div style={{...s.board, background: '#0a0e1a'}}>
        <div style={s.headerCenter}>
          <p style={{...s.brand, color: stepColor}}>⚠️ {step}</p>
          <p style={{...s.title, fontSize: 30}}>{title}</p>
        </div>
        
        <div style={s.bodyCenter}>
          <div style={{
            ...s.guideBanner,
            background: mainBg,
            borderColor: mainBorder
          }}>
            <p style={{...s.guideMain, color: mainColor}}>{mainBanner}</p>
            <p style={s.guideSub}>{subText}</p>
          </div>

          <div style={{...s.progressBox, opacity: pulse ? 1 : 0.6}}>
            <div style={s.spinner}></div>
            <p style={s.progressText}>{progressText}</p>
          </div>

          <div style={s.audienceGuide}>
            <p style={s.audienceTitle}>📢 다른 모든 형사들</p>
            <p style={s.audienceMain}>{audienceText}</p>
            <p style={s.audienceSub}>이 사람의 확인을 기다리는 중입니다</p>
          </div>
        </div>

        <p style={s.footerCenter}>CASE #{roomCode}</p>
      </div>
    </div>
  )
}

// ============ 6. 게임 진행 보드 (메인 보드) ============
function PlayingBoard({ roomCode, roomData, rolesData, playerList }) {
  const meta = roomData.meta || {}
  
  return (
    <div style={s.wrap}>
      <div style={s.mainBoard}>
        <div style={s.boardHeader}>
          <div>
            <span style={s.boardCase}>CASE</span>
            <span style={s.boardCode}>#{roomCode}</span>
          </div>
          <div>
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
          ⚠️ 마커 배치, 라운드 진행 등은 MVP 2-B-2에서 추가됩니다
        </div>
      </div>
    </div>
  )
}

function PlaceholderTile({ category, fixed }) {
  return (
    <div style={{...s.tile, ...(fixed ? s.tileFixed : {})}}>
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
  
  board: {
    width: '100%',
    maxWidth: 1400,
    aspectRatio: '1180 / 820',
    background: '#1A2332',
    border: '0.5px solid rgba(244, 232, 208, 0.15)',
    borderRadius: 12,
    padding: 24,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    color: '#F4E8D0',
    fontFamily: 'inherit'
  },
  headerCenter: {
    textAlign: 'center',
    paddingBottom: 16,
    borderBottom: '0.5px solid rgba(244, 232, 208, 0.15)'
  },
  brand: {
    fontSize: 14,
    letterSpacing: 4,
    color: '#FFE600',
    margin: 0,
    fontWeight: 500
  },
  title: {
    fontSize: 26,
    fontWeight: 500,
    margin: '8px 0 0',
    color: '#F4E8D0'
  },
  body: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 32,
    alignItems: 'center'
  },
  bodyCenter: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 28,
    alignItems: 'center',
    padding: '20px 40px'
  },

  // 대기실
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
  footerCenter: {
    textAlign: 'center',
    fontSize: 12,
    color: '#888780',
    margin: 0,
    paddingTop: 12,
    borderTop: '0.5px solid rgba(244, 232, 208, 0.1)',
    letterSpacing: 2
  },

  // 단계 안내 배너
  guideBanner: {
    border: '0.5px solid',
    borderRadius: 12,
    padding: '24px 32px',
    textAlign: 'center',
    maxWidth: 700,
    width: '100%'
  },
  guideMain: {
    fontSize: 32,
    fontWeight: 500,
    margin: '0 0 16px',
    letterSpacing: -0.5
  },
  guideSub: {
    fontSize: 16,
    color: '#F4E8D0',
    margin: 0,
    lineHeight: 1.7
  },

  progressBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    background: 'rgba(244, 232, 208, 0.03)',
    border: '0.5px solid rgba(244, 232, 208, 0.1)',
    borderRadius: 8,
    padding: '14px 24px',
    transition: 'opacity 0.6s ease'
  },
  spinner: {
    width: 28,
    height: 28,
    border: '3px solid rgba(255, 230, 0, 0.2)',
    borderTopColor: '#FFE600',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  progressText: {
    fontSize: 16,
    color: '#FFE600',
    margin: 0
  },

  audienceGuide: {
    background: 'rgba(244, 232, 208, 0.05)',
    border: '0.5px dashed rgba(244, 232, 208, 0.2)',
    borderRadius: 8,
    padding: '14px 24px',
    textAlign: 'center',
    maxWidth: 600,
    width: '100%'
  },
  audienceTitle: {
    fontSize: 13,
    color: '#888780',
    letterSpacing: 2,
    margin: '0 0 8px'
  },
  audienceMain: {
    fontSize: 18,
    color: '#F4E8D0',
    margin: 0,
    fontWeight: 500
  },
  audienceSub: {
    fontSize: 12,
    color: '#888780',
    margin: '6px 0 0'
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

// CSS 애니메이션
if (typeof document !== 'undefined' && !document.getElementById('broker-board-animations')) {
  const style = document.createElement('style')
  style.id = 'broker-board-animations'
  style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }'
  document.head.appendChild(style)
}
