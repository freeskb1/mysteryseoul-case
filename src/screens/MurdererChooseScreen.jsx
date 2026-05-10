import { useState } from 'react'

export default function MurdererChooseScreen({ me, onConfirm }) {
  const [selectedWeapon, setSelectedWeapon] = useState(null)
  const [selectedClue, setSelectedClue] = useState(null)
  const [confirming, setConfirming] = useState(false)

  async function handleConfirm() {
    if (!selectedWeapon || !selectedClue) return
    setConfirming(true)
    try {
      await onConfirm(selectedWeapon, selectedClue)
    } catch (e) {
      alert('확정 실패: ' + e.message)
      setConfirming(false)
    }
  }

  const canConfirm = selectedWeapon && selectedClue && !confirming

  return (
    <div style={s.wrap}>
      <div style={s.phone}>
        <div style={s.header}>
          <p style={s.warningTag}>⚠️ MURDERER ONLY</p>
          <p style={s.title}>범행 도구 선택</p>
          <p style={s.guide}>이번 한 번뿐입니다. 머리로 잘 기억하세요.</p>
        </div>

        <div style={s.section}>
          <div style={s.sectionHeader}>
            <p style={s.sectionLabel}>사인 (1장 선택)</p>
            {selectedWeapon && (
              <p style={s.sectionStatus}>✓ {selectedWeapon.name_ko}</p>
            )}
          </div>
          <div style={s.cardsGrid}>
            {me.weapons.map(w => {
              const isSelected = selectedWeapon?.id === w.id
              return (
                <button
                  key={w.id}
                  onClick={() => setSelectedWeapon(w)}
                  style={{
                    ...s.weaponCard,
                    border: isSelected ? '2.5px solid #FFE600' : '2.5px solid transparent',
                    boxShadow: isSelected ? 'inset 0 0 0 2px #1A2332' : 'none'
                  }}
                >
                  {w.name_ko}
                </button>
              )
            })}
          </div>
        </div>

        <div style={s.section}>
          <div style={s.sectionHeader}>
            <p style={s.sectionLabel}>단서 (1장 선택)</p>
            {selectedClue && (
              <p style={s.sectionStatus}>✓ {selectedClue.name_ko}</p>
            )}
          </div>
          <div style={s.cardsGrid}>
            {me.clues.map(c => {
              const isSelected = selectedClue?.id === c.id
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedClue(c)}
                  style={{
                    ...s.clueCard,
                    border: isSelected ? '2.5px solid #FFE600' : '2.5px solid transparent',
                    boxShadow: isSelected ? 'inset 0 0 0 2px #1A2332' : 'none'
                  }}
                >
                  {c.name_ko}
                </button>
              )
            })}
          </div>
        </div>

        <div style={s.warningBox}>
          ⚠️ 확정 후에는 바꿀 수 없습니다<br/>
          다른 사람들은 눈을 감고 있습니다
        </div>

        <button
          onClick={handleConfirm}
          disabled={!canConfirm}
          style={{
            ...s.confirmBtn,
            opacity: canConfirm ? 1 : 0.4,
            cursor: canConfirm ? 'pointer' : 'not-allowed'
          }}
        >
          {confirming ? '확정 중...' : '범행 확정 →'}
        </button>
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
  header: {
    textAlign: 'center',
    paddingBottom: 12,
    borderBottom: '0.5px solid rgba(230, 57, 70, 0.4)'
  },
  warningTag: {
    fontSize: 11,
    letterSpacing: 2,
    color: '#E63946',
    margin: 0
  },
  title: {
    fontSize: 18,
    fontWeight: 500,
    margin: '6px 0 4px',
    color: '#F4E8D0'
  },
  guide: {
    fontSize: 11,
    color: '#888780',
    margin: 0
  },
  section: {},
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8
  },
  sectionLabel: {
    fontSize: 12,
    color: '#888780',
    letterSpacing: 1,
    margin: 0
  },
  sectionStatus: {
    fontSize: 11,
    color: '#5DCAA5',
    margin: 0
  },
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 8
  },
  weaponCard: {
    background: '#C97A4A',
    color: '#2C1810',
    padding: '16px 8px',
    borderRadius: 8,
    minHeight: 60,
    fontSize: 16,
    fontWeight: 500,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  clueCard: {
    background: '#5DCAA5',
    color: '#04342C',
    padding: '16px 8px',
    borderRadius: 8,
    minHeight: 60,
    fontSize: 16,
    fontWeight: 500,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  warningBox: {
    background: 'rgba(230, 57, 70, 0.15)',
    border: '0.5px solid rgba(230, 57, 70, 0.4)',
    borderRadius: 8,
    padding: 12,
    textAlign: 'center',
    fontSize: 12,
    color: '#F4E8D0',
    lineHeight: 1.5,
    marginTop: 4
  },
  confirmBtn: {
    background: '#FFE600',
    color: '#1A2332',
    border: 'none',
    padding: 16,
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 500,
    marginTop: 'auto'
  }
}
