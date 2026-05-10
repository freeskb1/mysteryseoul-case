import { useState } from 'react'

/**
 * 공범자에게 살인자 정보를 노출하는 화면
 * - 공범자: 살인자 이름 + 사인 + 단서 일시 표시
 * - 다른 사람: "가리기" 안내
 */
export default function AccompliceRevealScreen({ me, murderer, onConfirm }) {
  const [showInfo, setShowInfo] = useState(false)
  const [confirming, setConfirming] = useState(false)

  async function handleConfirm() {
    setConfirming(true)
    try {
      await onConfirm()
    } catch (e) {
      alert('확인 처리 실패: ' + e.message)
      setConfirming(false)
    }
  }

  return (
    <div style={s.wrap}>
      <div style={s.phone}>
        <div style={s.header}>
          <p style={s.warningTag}>⚠️ ACCOMPLICE ONLY</p>
          <p style={s.title}>당신은 공범자입니다</p>
          <p style={s.guide}>살인자가 누군지, 무엇으로 무엇을 했는지 알려드립니다.</p>
        </div>

        {!showInfo ? (
          <button onClick={() => setShowInfo(true)} style={s.peekBtn}>
            🤝 진실 확인하기 (탭)
          </button>
        ) : (
          <div style={s.infoStack}>
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
          </div>
        )}

        <div style={s.warningBox}>
          ⚠️ 이 정보는 게임 중 다시 볼 수 없습니다<br/>
          외워두고 살인자를 보호하세요
        </div>

        {showInfo && (
          <button
            onClick={handleConfirm}
            disabled={confirming}
            style={{
              ...s.confirmBtn,
              opacity: confirming ? 0.5 : 1
            }}
          >
            {confirming ? '확인 중...' : '✓ 확인 완료, 다시 가리기'}
          </button>
        )}
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
    padding: 16,
    background: '#0a0e1a'
  },
  phone: {
    width: '100%',
    maxWidth: 360,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    padding: 18,
    boxSizing: 'border-box'
  },
  header: {
    textAlign: 'center',
    paddingBottom: 12,
    borderBottom: '0.5px solid rgba(133, 79, 11, 0.4)'
  },
  warningTag: {
    fontSize: 11,
    letterSpacing: 2,
    color: '#C97A4A',
    margin: 0
  },
  title: {
    fontSize: 22,
    fontWeight: 500,
    margin: '8px 0 6px',
    color: '#F4E8D0'
  },
  guide: {
    fontSize: 12,
    color: '#888780',
    margin: 0,
    lineHeight: 1.6
  },
  peekBtn: {
    background: '#C97A4A',
    color: '#2C1810',
    border: 'none',
    padding: '32px 16px',
    borderRadius: 10,
    fontSize: 18,
    fontWeight: 600,
    cursor: 'pointer',
    margin: '20px 0',
    width: '100%'
  },
  infoStack: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    margin: '8px 0'
  },
  infoBox: {
    background: 'rgba(244, 232, 208, 0.05)',
    border: '0.5px solid rgba(255, 230, 0, 0.3)',
    borderRadius: 8,
    padding: 16
  },
  infoLabel: {
    fontSize: 10,
    color: '#888780',
    letterSpacing: 1,
    margin: 0
  },
  infoValue: {
    fontSize: 22,
    fontWeight: 500,
    color: '#FFE600',
    margin: '6px 0 0',
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
    lineHeight: 1.6,
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
    cursor: 'pointer',
    marginTop: 'auto'
  }
}
