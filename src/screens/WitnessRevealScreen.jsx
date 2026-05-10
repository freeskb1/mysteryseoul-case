import { useState } from 'react'

/**
 * 목격자에게 후보자 정보를 노출하는 화면
 * - 살인자 + 공범자 = 후보 2명을 보여주지만, 누가 살인자인지는 모름
 * - 옵션: 공범자 OFF면 후보 1명만 (= 살인자만)
 */
export default function WitnessRevealScreen({ candidates, onConfirm }) {
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
          <p style={s.warningTag}>⚠️ WITNESS ONLY</p>
          <p style={s.title}>당신은 목격자입니다</p>
          <p style={s.guide}>
            {candidates.length === 1
              ? '살인자 후보 1명을 알려드립니다.'
              : '살인자 + 공범자 후보 2명을 알려드립니다.'}
            <br/>
            <strong style={{color: '#FFE600'}}>누가 누군지는 알 수 없습니다.</strong>
          </p>
        </div>

        {!showInfo ? (
          <button onClick={() => setShowInfo(true)} style={s.peekBtn}>
            👁 후보 확인하기 (탭)
          </button>
        ) : (
          <div style={s.candidatesStack}>
            <p style={s.candidatesLabel}>의심스러운 인물</p>
            {candidates.map((c, idx) => (
              <div key={c.uid || idx} style={s.candidateBox}>
                <span style={s.candidateNum}>{idx + 1}</span>
                <span style={s.candidateName}>{c.name}</span>
              </div>
            ))}
            <p style={s.candidatesNote}>
              ⚠️ 둘 중 한 명은 살인자, 한 명은 공범자입니다.<br/>
              어느 쪽인지는 게임 중 직접 알아내야 합니다.
            </p>
          </div>
        )}

        <div style={s.warningBox}>
          ⚠️ 정체를 들키면 살인자가 당신을 지목해 역전합니다<br/>
          신중하게 행동하세요
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
    borderBottom: '0.5px solid rgba(60, 52, 137, 0.4)'
  },
  warningTag: {
    fontSize: 11,
    letterSpacing: 2,
    color: '#AFA9EC',
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
    background: '#3C3489',
    color: '#FFFFFF',
    border: 'none',
    padding: '32px 16px',
    borderRadius: 10,
    fontSize: 18,
    fontWeight: 600,
    cursor: 'pointer',
    margin: '20px 0',
    width: '100%'
  },
  candidatesStack: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    margin: '8px 0'
  },
  candidatesLabel: {
    fontSize: 11,
    color: '#888780',
    letterSpacing: 1,
    margin: 0,
    textAlign: 'center'
  },
  candidateBox: {
    background: 'rgba(60, 52, 137, 0.2)',
    border: '0.5px solid rgba(175, 169, 236, 0.4)',
    borderRadius: 8,
    padding: '16px 18px',
    display: 'flex',
    alignItems: 'center',
    gap: 14
  },
  candidateNum: {
    background: '#AFA9EC',
    color: '#1A2332',
    width: 32,
    height: 32,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    fontWeight: 600,
    flexShrink: 0
  },
  candidateName: {
    fontSize: 22,
    fontWeight: 500,
    color: '#F4E8D0'
  },
  candidatesNote: {
    fontSize: 11,
    color: '#888780',
    margin: '8px 0 0',
    textAlign: 'center',
    lineHeight: 1.6
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
