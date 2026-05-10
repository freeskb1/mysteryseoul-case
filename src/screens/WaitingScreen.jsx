export default function WaitingScreen({ message, subMessage, icon = '⏳' }) {
  return (
    <div style={s.wrap}>
      <div style={s.phone}>
        <div style={s.coverNotice}>
          <p style={s.coverIcon}>🙈</p>
          <p style={s.coverMain}>고개를 숙이고<br/>폰을 가려주세요</p>
          <p style={s.coverSub}>다른 사람이 보지 못하게</p>
        </div>

        <div style={s.middleBox}>
          <div style={s.spinnerSmall}></div>
          <p style={s.message}>{message}</p>
          {subMessage && <p style={s.subMessage}>{subMessage}</p>}
        </div>

        <div style={s.tipBox}>
          <p style={s.tipText}>
            진행 안내는 <strong style={{color: '#FFE600'}}>큰 화면</strong>에서 확인하세요
          </p>
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
    padding: 20,
    background: '#0a0e1a'
  },
  phone: {
    width: '100%',
    maxWidth: 360,
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
    padding: 30,
    boxSizing: 'border-box'
  },
  coverNotice: {
    background: 'rgba(230, 57, 70, 0.15)',
    border: '0.5px solid rgba(230, 57, 70, 0.4)',
    borderRadius: 12,
    padding: '24px 16px',
    textAlign: 'center',
    marginTop: 24
  },
  coverIcon: {
    fontSize: 64,
    margin: 0,
    lineHeight: 1
  },
  coverMain: {
    fontSize: 22,
    fontWeight: 500,
    color: '#F4E8D0',
    margin: '12px 0 6px',
    lineHeight: 1.5
  },
  coverSub: {
    fontSize: 12,
    color: '#888780',
    margin: 0
  },
  middleBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
    padding: 20
  },
  spinnerSmall: {
    width: 24,
    height: 24,
    border: '2px solid rgba(255, 230, 0, 0.2)',
    borderTopColor: '#FFE600',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  message: {
    fontSize: 14,
    color: '#FFE600',
    textAlign: 'center',
    margin: 0,
    fontWeight: 500
  },
  subMessage: {
    fontSize: 11,
    color: '#888780',
    textAlign: 'center',
    margin: 0
  },
  tipBox: {
    background: 'rgba(244, 232, 208, 0.05)',
    border: '0.5px dashed rgba(244, 232, 208, 0.2)',
    borderRadius: 8,
    padding: 14,
    textAlign: 'center'
  },
  tipText: {
    fontSize: 12,
    color: '#888780',
    margin: 0,
    lineHeight: 1.6
  }
}

if (typeof document !== 'undefined' && !document.getElementById('waiting-animations')) {
  const style = document.createElement('style')
  style.id = 'waiting-animations'
  style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }'
  document.head.appendChild(style)
}
