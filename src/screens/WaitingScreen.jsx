export default function WaitingScreen({ message, subMessage, icon = '⏳' }) {
  return (
    <div style={s.wrap}>
      <div style={s.phone}>
        <div style={s.iconBig}>{icon}</div>
        <p style={s.message}>{message}</p>
        {subMessage && <p style={s.subMessage}>{subMessage}</p>}
        <div style={s.spinner}></div>
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
    alignItems: 'center',
    padding: 40
  },
  iconBig: {
    fontSize: 64,
    margin: '40px 0 0'
  },
  message: {
    fontSize: 18,
    fontWeight: 500,
    color: '#F4E8D0',
    textAlign: 'center',
    margin: 0
  },
  subMessage: {
    fontSize: 13,
    color: '#888780',
    textAlign: 'center',
    margin: 0,
    lineHeight: 1.6
  },
  spinner: {
    width: 28,
    height: 28,
    border: '3px solid rgba(255, 230, 0, 0.2)',
    borderTopColor: '#FFE600',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginTop: 24
  }
}

if (typeof document !== 'undefined' && !document.getElementById('waiting-animations')) {
  const style = document.createElement('style')
  style.id = 'waiting-animations'
  style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }'
  document.head.appendChild(style)
}
