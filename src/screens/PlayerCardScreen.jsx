import { useState } from 'react'

export default function PlayerCardScreen({ roomData, currentUserId, rolesData, onLeave }) {
  const me = roomData.players?.[currentUserId]
  const [showRole, setShowRole] = useState(false)
  
  if (!me) {
    return <div style={s.loading}>플레이어 데이터 로드 중...</div>
  }

  const myRole = rolesData.find(r => r.id === me.role)
  const allPlayers = Object.entries(roomData.players || {}).map(([uid, p]) => ({ uid, ...p }))

  // 카드가 아직 분배되지 않은 경우
  if (!me.weapons || !me.clues) {
    return (
      <div style={s.wrap}>
        <div style={s.phone}>
          <p style={{textAlign: 'center', color: '#888780', marginTop: 60}}>
            카드 분배 중...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={s.wrap}>
      <div style={s.phone}>
        <div style={s.header}>
          <p style={s.brand}>CASE FILE</p>
          <p style={s.name}>{me.name}</p>
        </div>

        <div style={s.section}>
          <p style={s.sectionLabel}>사인 카드</p>
          <div style={s.cardsGrid}>
            {me.weapons.map(w => (
              <div key={w.id} style={s.weaponCard}>
                <span style={s.cardText}>{w.name_ko}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={s.section}>
          <p style={s.sectionLabel}>단서 카드</p>
          <div style={s.cardsGrid}>
            {me.clues.map(c => (
              <div key={c.id} style={s.clueCard}>
                <span style={s.cardText}>{c.name_ko}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={s.statsBar}>
          <div style={s.statItem}>
            <p style={s.statLabel}>참가자</p>
            <p style={s.statValue}>{allPlayers.length}명</p>
          </div>
          <div style={s.statItem}>
            <p style={s.statLabel}>당신의 역할</p>
            <button 
              onClick={() => setShowRole(!showRole)}
              style={s.roleToggle}
            >
              {showRole ? `${myRole.icon} ${myRole.name_ko}` : '👁 보기'}
            </button>
          </div>
        </div>

        {showRole && (
          <div style={{
            ...s.rolePanel,
            borderColor: myRole.color
          }}>
            <p style={s.roleHint}>본인만 확인하세요</p>
            <p style={{...s.roleName, color: myRole.color}}>
              {myRole.icon} {myRole.name_ko}
            </p>
            <p style={s.roleDesc}>{myRole.description_ko}</p>
            <button 
              onClick={() => setShowRole(false)}
              style={s.hideBtn}
            >
              가리기
            </button>
          </div>
        )}

        <div style={s.bottomArea}>
          <p style={s.mvpNote}>
            ⚠️ MVP 1차: 카드 + 역할 표시만 가능<br/>
            마커, 추리, 결과 등은 다음 버전에 추가됩니다
          </p>
          <button onClick={onLeave} style={s.leaveBtn}>
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
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: 20
  },
  phone: {
    width: '100%',
    maxWidth: 360,
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    padding: 18,
    boxSizing: 'border-box'
  },
  loading: {
    textAlign: 'center',
    padding: 60,
    color: '#888780'
  },
  header: {
    textAlign: 'center',
    paddingBottom: 10,
    borderBottom: '0.5px solid rgba(244, 232, 208, 0.15)'
  },
  brand: {
    fontSize: 11,
    letterSpacing: 2,
    color: '#888780',
    margin: 0
  },
  name: {
    fontSize: 17,
    fontWeight: 500,
    color: '#F4E8D0',
    margin: '4px 0 0'
  },
  section: {},
  sectionLabel: {
    fontSize: 12,
    color: '#888780',
    letterSpacing: 1,
    margin: '0 0 8px'
  },
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 8
  },
  weaponCard: {
    background: '#C97A4A',
    padding: '18px 8px',
    borderRadius: 6,
    minHeight: 64,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center'
  },
  clueCard: {
    background: '#5DCAA5',
    padding: '18px 8px',
    borderRadius: 6,
    minHeight: 64,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center'
  },
  cardText: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '100%',
    color: '#1A2332'
  },
  statsBar: {
    display: 'flex',
    gap: 6,
    padding: '10px 4px',
    borderTop: '0.5px solid rgba(244, 232, 208, 0.15)',
    borderBottom: '0.5px solid rgba(244, 232, 208, 0.15)'
  },
  statItem: {
    flex: 1,
    textAlign: 'center'
  },
  statLabel: {
    color: '#888780',
    fontSize: 11,
    margin: 0
  },
  statValue: {
    color: '#F4E8D0',
    fontSize: 14,
    fontWeight: 500,
    margin: '4px 0 0'
  },
  roleToggle: {
    background: 'transparent',
    color: '#FFE600',
    border: '0.5px solid rgba(255, 230, 0, 0.4)',
    padding: '4px 10px',
    fontSize: 12,
    borderRadius: 4,
    cursor: 'pointer',
    marginTop: 2
  },
  rolePanel: {
    background: '#F4E8D0',
    border: '2px solid',
    borderRadius: 8,
    padding: 16,
    textAlign: 'center'
  },
  roleHint: {
    fontSize: 10,
    color: '#888780',
    letterSpacing: 2,
    margin: '0 0 8px'
  },
  roleName: {
    fontSize: 24,
    fontWeight: 500,
    margin: '0 0 6px'
  },
  roleDesc: {
    fontSize: 13,
    color: '#1A2332',
    margin: '0 0 12px'
  },
  hideBtn: {
    background: 'transparent',
    color: '#888780',
    border: '0.5px solid rgba(0, 0, 0, 0.2)',
    padding: '6px 18px',
    fontSize: 12,
    borderRadius: 4,
    cursor: 'pointer'
  },
  bottomArea: {
    marginTop: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    paddingTop: 10
  },
  mvpNote: {
    background: 'rgba(255, 230, 0, 0.05)',
    border: '0.5px dashed rgba(255, 230, 0, 0.3)',
    borderRadius: 6,
    padding: '10px 12px',
    fontSize: 11,
    color: '#888780',
    textAlign: 'center',
    margin: 0,
    lineHeight: 1.5
  },
  leaveBtn: {
    background: 'transparent',
    color: '#888780',
    border: '0.5px solid rgba(244, 232, 208, 0.2)',
    padding: 10,
    borderRadius: 8,
    fontSize: 12,
    cursor: 'pointer'
  }
}
