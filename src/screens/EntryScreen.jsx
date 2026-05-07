export default function EntryScreen({ onSelectHost, onSelectJoin }) {
  return (
    <div style={s.wrap}>
      <div style={s.phone}>
        <div style={s.titleArea}>
          <p style={s.brand}>SEOUL COLD CASE</p>
          <p style={s.title}>서울, 미제사건</p>
          <p style={s.tagline}>당신 옆의 그 사람,<br/>정말 동료입니까?</p>
        </div>
        
        <div style={s.buttons}>
          <button onClick={onSelectHost} style={s.primaryBtn}>
            ＋ 새 사건 만들기
          </button>
          <button onClick={onSelectJoin} style={s.secondaryBtn}>
            ↪ 사건 참여하기
          </button>
        </div>
        
        <p style={s.version}>v0.1 MVP · 4–12명용</p>
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
    gap: 24,
    minHeight: 600,
    padding: '40px 20px',
    boxSizing: 'border-box'
  },
  titleArea: {
    textAlign: 'center',
    marginTop: 40
  },
  brand: {
    fontSize: 11,
    letterSpacing: 4,
    color: '#FFE600',
    margin: 0
  },
  title: {
    fontSize: 28,
    fontWeight: 500,
    margin: '12px 0 8px',
    color: '#F4E8D0'
  },
  tagline: {
    fontSize: 12,
    color: '#888780',
    fontStyle: 'italic',
    lineHeight: 1.6,
    margin: 0
  },
  buttons: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    marginTop: 'auto'
  },
  primaryBtn: {
    background: '#FFE600',
    color: '#1A2332',
    border: 'none',
    padding: 18,
    borderRadius: 8,
    fontSize: 16,
    fontWeight: 500,
    cursor: 'pointer'
  },
  secondaryBtn: {
    background: 'transparent',
    color: '#F4E8D0',
    border: '0.5px solid rgba(244, 232, 208, 0.4)',
    padding: 18,
    borderRadius: 8,
    fontSize: 16,
    fontWeight: 500,
    cursor: 'pointer'
  },
  version: {
    textAlign: 'center',
    fontSize: 11,
    color: '#888780',
    margin: '20px 0 0'
  }
}
