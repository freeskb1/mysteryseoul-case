/**
 * 법의학자 진행자 가이드 화면
 * 살인자/공범자/목격자 단계 동안 법의학자 폰에 표시
 * 사람이 직접 읽을 수 있는 진행 멘트 + 큰 화면 안내와 동일한 단계 표시
 */
export default function ForensicProgressGuide({ phase, roomData }) {
  const players = roomData.players || {}
  const murderer = Object.values(players).find(p => p.role === 'murderer')
  const accomplice = Object.values(players).find(p => p.role === 'accomplice')
  const witness = Object.values(players).find(p => p.role === 'witness')

  const config = getPhaseConfig(phase, { murderer, accomplice, witness })

  return (
    <div style={s.wrap}>
      <div style={s.phone}>
        <div style={s.header}>
          <p style={s.role}>🔬 법의학자 (진행자)</p>
          <p style={{...s.stepTag, color: config.stepColor}}>{config.step}</p>
        </div>

        {/* 진행 안내 큰 박스 */}
        <div style={{...s.scriptBox, borderColor: config.borderColor, background: config.bgColor}}>
          <p style={s.scriptHint}>📢 아래 멘트를 읽어주세요</p>
          <p style={{...s.scriptMain, color: config.mainColor}}>"{config.mainScript}"</p>
          {config.subScript && (
            <p style={s.scriptSub}>"{config.subScript}"</p>
          )}
        </div>

        {/* 진행 상태 */}
        <div style={s.statusBox}>
          <div style={s.spinner}></div>
          <p style={s.statusText}>{config.statusText}</p>
        </div>

        {/* 다음 단계 미리보기 */}
        {config.nextHint && (
          <div style={s.nextHint}>
            <p style={s.nextLabel}>다음</p>
            <p style={s.nextText}>{config.nextHint}</p>
          </div>
        )}
      </div>
    </div>
  )
}

function getPhaseConfig(phase, { murderer, accomplice, witness }) {
  switch (phase) {
    case 'murderer_choosing':
      return {
        step: 'STEP 1',
        stepColor: '#E63946',
        mainColor: '#E63946',
        bgColor: 'rgba(230, 57, 70, 0.12)',
        borderColor: 'rgba(230, 57, 70, 0.4)',
        mainScript: '모두 눈을 감으세요.',
        subScript: '살인범만 눈을 뜨고, 본인 폰에서 사인 1장과 단서 1장을 선택하세요.',
        statusText: murderer ? `${murderer.name}이(가) 결정 중...` : '살인자 결정 중...',
        nextHint: accomplice ? '공범자에게 진실 알리기' : witness ? '목격자에게 후보 알리기' : '당신(법의학자) 콘솔 인계'
      }

    case 'accomplice_reveal':
      return {
        step: 'STEP 2',
        stepColor: '#C97A4A',
        mainColor: '#C97A4A',
        bgColor: 'rgba(133, 79, 11, 0.18)',
        borderColor: 'rgba(201, 122, 74, 0.4)',
        mainScript: '살인범, 다시 눈을 감으세요.',
        subScript: '공범자만 눈을 떠서 본인 폰을 확인하세요.',
        statusText: accomplice ? `${accomplice.name}이(가) 확인 중...` : '공범자 확인 중...',
        nextHint: witness ? '목격자에게 후보 알리기' : '당신(법의학자) 콘솔 인계'
      }

    case 'witness_reveal':
      return {
        step: 'STEP 3',
        stepColor: '#AFA9EC',
        mainColor: '#AFA9EC',
        bgColor: 'rgba(60, 52, 137, 0.2)',
        borderColor: 'rgba(175, 169, 236, 0.4)',
        mainScript: '공범자, 다시 눈을 감으세요.',
        subScript: '목격자만 눈을 떠서 본인 폰의 후보 명단을 확인하세요.',
        statusText: witness ? `${witness.name}이(가) 확인 중...` : '목격자 확인 중...',
        nextHint: '당신(법의학자) 콘솔 인계'
      }

    default:
      return {
        step: '대기',
        stepColor: '#888780',
        mainColor: '#888780',
        bgColor: 'rgba(244, 232, 208, 0.05)',
        borderColor: 'rgba(244, 232, 208, 0.15)',
        mainScript: '잠시만 기다려 주세요.',
        subScript: null,
        statusText: '진행 중...',
        nextHint: null
      }
  }
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
    borderBottom: '0.5px solid rgba(244, 232, 208, 0.15)'
  },
  role: {
    fontSize: 12,
    color: '#5DCAA5',
    letterSpacing: 2,
    margin: 0,
    fontWeight: 500
  },
  stepTag: {
    fontSize: 18,
    fontWeight: 600,
    margin: '8px 0 0',
    letterSpacing: 3
  },
  scriptBox: {
    border: '0.5px solid',
    borderRadius: 12,
    padding: '20px 18px',
    textAlign: 'center'
  },
  scriptHint: {
    fontSize: 11,
    color: '#888780',
    letterSpacing: 1,
    margin: '0 0 14px'
  },
  scriptMain: {
    fontSize: 22,
    fontWeight: 600,
    margin: '0 0 12px',
    lineHeight: 1.4,
    letterSpacing: -0.5
  },
  scriptSub: {
    fontSize: 14,
    color: '#F4E8D0',
    margin: 0,
    lineHeight: 1.5,
    fontStyle: 'italic'
  },
  statusBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    background: 'rgba(244, 232, 208, 0.03)',
    border: '0.5px solid rgba(244, 232, 208, 0.1)',
    borderRadius: 8,
    padding: '14px 18px',
    justifyContent: 'center'
  },
  spinner: {
    width: 22,
    height: 22,
    border: '2.5px solid rgba(255, 230, 0, 0.2)',
    borderTopColor: '#FFE600',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  statusText: {
    fontSize: 14,
    color: '#FFE600',
    margin: 0
  },
  nextHint: {
    background: 'rgba(244, 232, 208, 0.05)',
    border: '0.5px dashed rgba(244, 232, 208, 0.2)',
    borderRadius: 6,
    padding: '12px 14px',
    display: 'flex',
    alignItems: 'center',
    gap: 12
  },
  nextLabel: {
    fontSize: 10,
    color: '#888780',
    letterSpacing: 2,
    margin: 0,
    flex: '0 0 auto'
  },
  nextText: {
    fontSize: 13,
    color: '#F4E8D0',
    margin: 0,
    lineHeight: 1.4
  }
}

if (typeof document !== 'undefined' && !document.getElementById('forensic-guide-animations')) {
  const style = document.createElement('style')
  style.id = 'forensic-guide-animations'
  style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }'
  document.head.appendChild(style)
}
