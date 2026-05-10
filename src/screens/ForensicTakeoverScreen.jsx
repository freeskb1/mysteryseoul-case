import { useState } from 'react'

export default function ForensicTakeoverScreen({ onTakeover }) {
  const [taking, setTaking] = useState(false)

  async function handleClick() {
    setTaking(true)
    try {
      await onTakeover()
    } catch (e) {
      alert('인계 실패: ' + e.message)
      setTaking(false)
    }
  }

  return (
    <div style={s.wrap}>
      <div style={s.phone}>
        <div style={s.header}>
          <p style={s.brand}>FORENSIC SCIENTIST</p>
          <p style={s.title}>당신은 법의학자입니다</p>
        </div>

        <div style={s.iconBig}>🔬</div>

        <p style={s.guide}>
          당신은 사건의 진실을 아는<br/>유일한 사람입니다.
        </p>

        <div style={s.steps}>
          <div style={s.step}>
            <span style={s.stepNum}>1</span>
            <span>큰 화면(중계용 단말) 앞으로 이동하세요</span>
          </div>
          <div style={s.step}>
            <span style={s.stepNum}>2</span>
            <span>아래 버튼을 누르면 큰 화면이 콘솔 모드로 바뀝니다</span>
          </div>
          <div style={s.step}>
            <span style={s.stepNum}>3</span>
            <span>큰 화면에서 마커를 배치하며 단서를 흘리세요</span>
          </div>
        </div>

        <button
          onClick={handleClick}
          disabled={taking}
          style={{
            ...s.takeoverBtn,
            opacity: taking ? 0.5 : 1
          }}
        >
          {taking ? '인계 중...' : '🔬 제가 법의학자입니다'}
        </button>
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
    padding: 24,
    boxSizing: 'border-box'
  },
  header: {
    textAlign: 'center',
    paddingBottom: 12,
    borderBottom: '0.5px solid rgba(15, 110, 86, 0.4)'
  },
  brand: {
    fontSize: 11,
    letterSpacing: 3,
    color: '#5DCAA5',
    margin: 0
  },
  title: {
    fontSize: 20,
    fontWeight: 500,
    color: '#F4E8D0',
    margin: '8px 0 0'
  },
  iconBig: {
    fontSize: 72,
    textAlign: 'center',
    margin: '12px 0'
  },
  guide: {
    fontSize: 14,
    color: '#F4E8D0',
    textAlign: 'center',
    lineHeight: 1.7,
    margin: 0
  },
  steps: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    background: 'rgba(15, 110, 86, 0.1)',
    border: '0.5px solid rgba(93, 202, 165, 0.3)',
    borderRadius: 8,
    padding: 16,
    margin: '8px 0'
  },
  step: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    fontSize: 12,
    color: '#F4E8D0',
    lineHeight: 1.5
  },
  stepNum: {
    background: '#5DCAA5',
    color: '#04342C',
    fontWeight: 500,
    width: 22,
    height: 22,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 11,
    flexShrink: 0
  },
  takeoverBtn: {
    background: '#5DCAA5',
    color: '#04342C',
    border: 'none',
    padding: 18,
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 500,
    cursor: 'pointer',
    marginTop: 'auto'
  }
}
