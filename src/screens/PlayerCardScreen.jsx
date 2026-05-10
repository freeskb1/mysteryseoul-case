import { useState, useEffect, useRef } from 'react'

export default function PlayerCardScreen({ roomData, currentUserId, rolesData, onLeave }) {
  const me = roomData.players?.[currentUserId]
  
  if (!me) {
    return <div style={s.loading}>플레이어 데이터 로드 중...</div>
  }

  if (!me.weapons || !me.clues) {
    return (
      <div style={s.wrap}>
        <p style={{textAlign: 'center', color: '#888780', marginTop: 60}}>
          카드 분배 중...
        </p>
      </div>
    )
  }

  const myRole = rolesData.find(r => r.id === me.role)
  const isForensic = me.role === 'forensic'
  const phase = roomData.meta?.phase

  if (isForensic && phase === 'playing' && roomData.meta?.forensicTookOver) {
    const murdererId = roomData.meta?.murdererId
    const murderer = murdererId ? roomData.players[murdererId] : null
    return <ForensicConsolePhone me={me} myRole={myRole} murderer={murderer} roomData={roomData} onLeave={onLeave} />
  }

  return <NormalCardMat me={me} myRole={myRole} roomData={roomData} onLeave={onLeave} />
}

function NormalCardMat({ me, myRole, roomData, onLeave }) {
  const [showMenu, setShowMenu] = useState(false)
  const [showRole, setShowRole] = useState(false)
  const cardsGridRef = useRef(null)
  const allPlayers = Object.entries(roomData.players || {}).map(([uid, p]) => ({ uid, ...p }))

  useEffect(() => {
    function fitText() {
      const grid = cardsGridRef.current
      if (!grid) return
      const cards = grid.querySelectorAll('.card-cell')
      
      cards.forEach(card => {
        const emoji = card.querySelector('.emoji')
        const text = card.querySelector('.text')
        if (!emoji || !text) return
        
        const cardW = card.clientWidth
        const cardH = card.clientHeight
        if (cardW <= 0 || cardH <= 0) return
        
        const emojiSize = Math.floor(cardH * 0.5)
        emoji.style.fontSize = emojiSize + 'px'
        
        const maxTextH = Math.floor(cardH * 0.35)
        const maxTextW = cardW - 8
        
        let lo = 9, hi = maxTextH, best = 12
        while (lo <= hi) {
          const mid = Math.floor((lo + hi) / 2)
          text.style.fontSize = mid + 'px'
          const fits = text.scrollWidth <= maxTextW && text.scrollHeight <= maxTextH
          if (fits) {
            best = mid
            lo = mid + 1
          } else {
            hi = mid - 1
          }
        }
        text.style.fontSize = best + 'px'
      })
    }

    fitText()
    setTimeout(fitText, 100)
    setTimeout(fitText, 300)
    window.addEventListener('resize', fitText)
    return () => window.removeEventListener('resize', fitText)
  }, [me.weapons, me.clues])

  return (
    <div style={s.wrap}>
      <div style={s.miniHeader}>
        <span style={s.nameLabel}>{me.name}</span>
        <div style={s.headerRight}>
          <button onClick={() => setShowRole(!showRole)} style={s.roleBtn}>
            👁 역할
          </button>
          <button onClick={() => setShowMenu(!showMenu)} style={s.menuBtn}>⋯</button>
        </div>
      </div>

      <div ref={cardsGridRef} style={s.cardsGrid}>
        {me.weapons.map(w => (
          <div key={w.id} className="card-cell" style={s.weaponCard}>
            <span className="emoji" style={s.cardEmoji}>{w.emoji || '⚪'}</span>
            <span className="text" style={s.cardText}>{w.name_ko}</span>
          </div>
        ))}
        {me.clues.map(c => (
          <div key={c.id} className="card-cell" style={s.clueCard}>
            <span className="emoji" style={s.cardEmoji}>{c.emoji || '⚪'}</span>
            <span className="text" style={s.cardText}>{c.name_ko}</span>
          </div>
        ))}
      </div>

      {showRole && (
        <div style={s.rolePopupOverlay} onClick={() => setShowRole(false)}>
          <div style={{...s.rolePopup, borderColor: myRole.color}} onClick={(e) => e.stopPropagation()}>
            <p style={s.roleHint}>본인만 확인하세요</p>
            <p style={{...s.roleName, color: myRole.color}}>
              {myRole.icon} {myRole.name_ko}
            </p>
            <p style={s.roleDesc}>{myRole.description_ko}</p>
            <button onClick={() => setShowRole(false)} style={s.hideBtnSmall}>
              가리기
            </button>
          </div>
        </div>
      )}

      {showMenu && (
        <div style={s.menuOverlay} onClick={() => setShowMenu(false)}>
          <div style={s.menuPanel} onClick={(e) => e.stopPropagation()}>
            <div style={s.menuHeader}>
              <span style={s.menuTitle}>설정</span>
              <button onClick={() => setShowMenu(false)} style={s.closeBtn}>✕</button>
            </div>
            <div style={s.menuRow}>
              <span style={s.menuLabel}>참가자</span>
              <span style={s.menuValue}>{allPlayers.length}명</span>
            </div>
            <div style={s.menuDivider}></div>
            <button onClick={onLeave} style={s.leaveBtn}>방 나가기</button>
          </div>
        </div>
      )}
    </div>
  )
}

function ForensicConsolePhone({ me, myRole, murderer, roomData, onLeave }) {
  const [showInfo, setShowInfo] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const round = roomData.meta?.currentRound || 1
  
  return (
    <div style={s.wrap}>
      <div style={s.miniHeader}>
        <span style={{...s.nameLabel, color: '#5DCAA5'}}>🔬 법의학자</span>
        <button onClick={() => setShowMenu(!showMenu)} style={s.menuBtn}>⋯</button>
      </div>

      {/* 단계 가이드 — 법의학자가 진행자 역할 */}
      <div style={s.forensicStageBox}>
        <p style={s.forensicStageLabel}>현재 단계</p>
        <p style={s.forensicStageTitle}>라운드 {round} — 수사 진행 중</p>
        <div style={s.forensicStepList}>
          <div style={s.forensicStep}>
            <span style={s.forensicStepNum}>1</span>
            <span style={s.forensicStepText}>큰 화면의 6개 타일을 보고</span>
          </div>
          <div style={s.forensicStep}>
            <span style={s.forensicStepNum}>2</span>
            <span style={s.forensicStepText}>각 타일에 마커를 배치하여<br/>수사관들에게 단서를 주세요</span>
          </div>
          <div style={s.forensicStep}>
            <span style={s.forensicStepNum}>3</span>
            <span style={s.forensicStepText}>수사관들이 토론하는 동안<br/>마커 위치를 다듬을 수 있습니다</span>
          </div>
        </div>
        <p style={s.forensicNote}>
          ⚠️ MVP 2-A: 마커 배치는 2-B에서 활성화됩니다<br/>
          현재는 살인자 정보만 확인 가능
        </p>
      </div>

      {/* 살인자 정보 보기 */}
      <div style={s.forensicInfo}>
        <p style={s.infoSectionLabel}>아래 정보를 확인하고 마커 배치 전략을 세우세요</p>
        {!showInfo ? (
          <button onClick={() => setShowInfo(true)} style={s.peekBtn}>
            📋 살인자 정보 보기 (탭)
          </button>
        ) : (
          <>
            <div style={s.infoBox}>
              <p style={s.infoLabel}>살인자</p>
              <p style={s.infoValue}>
                {murderer ? murderer.name : '대기 중...'}
              </p>
            </div>
            <div style={{...s.infoBox, background: '#C97A4A', borderColor: 'transparent'}}>
              <p style={{...s.infoLabel, color: '#2C1810', opacity: 0.7}}>사용한 사인</p>
              <p style={{...s.infoValue, color: '#2C1810'}}>
                {murderer?.chosenWeapon ? `${murderer.chosenWeapon.emoji || ''} ${murderer.chosenWeapon.name_ko}` : '대기 중...'}
              </p>
            </div>
            <div style={{...s.infoBox, background: '#5DCAA5', borderColor: 'transparent'}}>
              <p style={{...s.infoLabel, color: '#04342C', opacity: 0.7}}>남긴 단서</p>
              <p style={{...s.infoValue, color: '#04342C'}}>
                {murderer?.chosenClue ? `${murderer.chosenClue.emoji || ''} ${murderer.chosenClue.name_ko}` : '대기 중...'}
              </p>
            </div>
            <button onClick={() => setShowInfo(false)} style={s.hideBtn}>
              가리기
            </button>
          </>
        )}
      </div>

      {showMenu && (
        <div style={s.menuOverlay} onClick={() => setShowMenu(false)}>
          <div style={s.menuPanel} onClick={(e) => e.stopPropagation()}>
            <div style={s.menuHeader}>
              <span style={s.menuTitle}>설정</span>
              <button onClick={() => setShowMenu(false)} style={s.closeBtn}>✕</button>
            </div>
            <button onClick={onLeave} style={s.leaveBtn}>방 나가기</button>
          </div>
        </div>
      )}
    </div>
  )
}

const s = {
  wrap: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    padding: '8px 8px 12px',
    boxSizing: 'border-box',
    position: 'relative'
  },
  loading: {
    textAlign: 'center',
    padding: 60,
    color: '#888780'
  },

  miniHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '4px 8px 8px',
    flex: '0 0 auto'
  },
  nameLabel: {
    fontSize: 12,
    color: '#888780',
    letterSpacing: 1
  },
  headerRight: {
    display: 'flex',
    gap: 8,
    alignItems: 'center'
  },
  roleBtn: {
    fontSize: 11,
    color: '#FFE600',
    background: 'transparent',
    border: '0.5px solid rgba(255, 230, 0, 0.4)',
    padding: '3px 10px',
    borderRadius: 3,
    cursor: 'pointer',
    fontFamily: 'inherit'
  },
  menuBtn: {
    background: 'transparent',
    color: '#888780',
    border: 'none',
    fontSize: 22,
    cursor: 'pointer',
    padding: '2px 8px',
    lineHeight: 1
  },

  cardsGrid: {
    flex: 1,
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gridTemplateRows: 'repeat(4, 1fr)',
    gap: 5,
    minHeight: 0
  },
  weaponCard: {
    background: '#C97A4A',
    borderRadius: 8,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    padding: '6px 4px',
    gap: 2,
    minHeight: 0,
    minWidth: 0
  },
  clueCard: {
    background: '#5DCAA5',
    borderRadius: 8,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    padding: '6px 4px',
    gap: 2,
    minHeight: 0,
    minWidth: 0
  },
  cardEmoji: {
    lineHeight: 1,
    flex: '0 0 auto'
  },
  cardText: {
    fontWeight: 700,
    letterSpacing: '-0.8px',
    color: '#1A2332',
    whiteSpace: 'nowrap',
    display: 'block',
    lineHeight: 1,
    flex: '0 0 auto',
    padding: '0 4px'
  },

  // 역할 팝업
  rolePopupOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
    padding: 30
  },
  rolePopup: {
    background: '#F4E8D0',
    border: '2px solid',
    borderRadius: 12,
    padding: 24,
    textAlign: 'center',
    maxWidth: 280,
    width: '100%'
  },
  roleHint: {
    fontSize: 11,
    color: '#888780',
    letterSpacing: 2,
    margin: '0 0 12px'
  },
  roleName: {
    fontSize: 28,
    fontWeight: 500,
    margin: '0 0 8px'
  },
  roleDesc: {
    fontSize: 13,
    color: '#1A2332',
    margin: '0 0 16px',
    lineHeight: 1.5
  },
  hideBtnSmall: {
    background: 'transparent',
    color: '#888780',
    border: '0.5px solid rgba(0, 0, 0, 0.2)',
    padding: '8px 24px',
    fontSize: 12,
    borderRadius: 4,
    cursor: 'pointer'
  },

  // 메뉴 오버레이
  menuOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'flex-end',
    zIndex: 50
  },
  menuPanel: {
    width: '100%',
    background: '#1A2332',
    borderTop: '0.5px solid rgba(244, 232, 208, 0.15)',
    borderRadius: '16px 16px 0 0',
    padding: '20px 20px 28px',
    display: 'flex',
    flexDirection: 'column',
    gap: 12
  },
  menuHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottom: '0.5px solid rgba(244, 232, 208, 0.1)'
  },
  menuTitle: {
    fontSize: 14,
    color: '#888780',
    letterSpacing: 1
  },
  closeBtn: {
    background: 'transparent',
    color: '#888780',
    border: 'none',
    fontSize: 18,
    cursor: 'pointer',
    padding: '4px 8px'
  },
  menuRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0'
  },
  menuLabel: {
    fontSize: 13,
    color: '#888780'
  },
  menuValue: {
    fontSize: 14,
    color: '#F4E8D0',
    fontWeight: 500
  },
  menuDivider: {
    height: 0.5,
    background: 'rgba(244, 232, 208, 0.1)',
    margin: '4px 0'
  },
  leaveBtn: {
    background: 'transparent',
    color: '#E63946',
    border: '0.5px solid rgba(230, 57, 70, 0.4)',
    padding: 12,
    borderRadius: 8,
    fontSize: 13,
    cursor: 'pointer'
  },

  // 법의학자 콘솔 — 단계 가이드
  forensicStageBox: {
    background: 'rgba(15, 110, 86, 0.12)',
    border: '0.5px solid rgba(93, 202, 165, 0.4)',
    borderRadius: 10,
    padding: 16,
    margin: '0 4px'
  },
  forensicStageLabel: {
    fontSize: 10,
    color: '#888780',
    letterSpacing: 2,
    margin: 0
  },
  forensicStageTitle: {
    fontSize: 16,
    fontWeight: 500,
    color: '#5DCAA5',
    margin: '4px 0 12px'
  },
  forensicStepList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8
  },
  forensicStep: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10
  },
  forensicStepNum: {
    background: '#5DCAA5',
    color: '#04342C',
    fontWeight: 500,
    width: 20,
    height: 20,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 11,
    flexShrink: 0,
    marginTop: 1
  },
  forensicStepText: {
    fontSize: 12,
    color: '#F4E8D0',
    lineHeight: 1.5
  },
  forensicNote: {
    fontSize: 10,
    color: '#888780',
    margin: '12px 0 0',
    padding: '8px 10px',
    background: 'rgba(255, 230, 0, 0.05)',
    border: '0.5px dashed rgba(255, 230, 0, 0.2)',
    borderRadius: 4,
    lineHeight: 1.5
  },

  // 살인자 정보 영역
  forensicInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    padding: '12px 4px',
    minHeight: 0
  },
  infoSectionLabel: {
    fontSize: 11,
    color: '#888780',
    margin: 0,
    textAlign: 'center'
  },
  peekBtn: {
    background: '#FFE600',
    color: '#1A2332',
    border: 'none',
    padding: '24px 16px',
    borderRadius: 10,
    fontSize: 16,
    fontWeight: 500,
    cursor: 'pointer',
    width: '100%'
  },
  infoBox: {
    background: 'rgba(244, 232, 208, 0.05)',
    border: '0.5px solid rgba(255, 230, 0, 0.3)',
    borderRadius: 8,
    padding: 14
  },
  infoLabel: {
    fontSize: 10,
    color: '#888780',
    letterSpacing: 1,
    margin: 0
  },
  infoValue: {
    fontSize: 20,
    fontWeight: 500,
    color: '#FFE600',
    margin: '6px 0 0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  hideBtn: {
    background: 'transparent',
    color: '#888780',
    border: '0.5px solid rgba(244, 232, 208, 0.2)',
    padding: 10,
    borderRadius: 6,
    fontSize: 12,
    cursor: 'pointer',
    marginTop: 4
  }
}
