import { useState } from 'react'

export default function HostStartScreen({ onCreate, onBack }) {
  const [nickname, setNickname] = useState('')
  const [creating, setCreating] = useState(false)

  async function handleSubmit() {
    const trimmed = nickname.trim()
    if (trimmed.length < 1 || trimmed.length > 8) {
      alert('닉네임은 1~8자로 입력해주세요')
      return
    }
    setCreating(true)
    try {
      await onCreate(trimmed)
    } catch (e) {
      alert('방 생성 실패: ' + e.message)
      setCreating(false)
    }
  }

  return (
    <div style={s.wrap}>
      <div style={s.phone}>
        <div style={s.header}>
          <button onClick={onBack} style={s.backBtn}>← 뒤로</button>
          <p style={s.title}>새 사건 생성</p>
        </div>

        <div style={s.body}>
          <p style={s.guide}>방을 만들면 4자리 코드가 발급됩니다.<br/>그 코드를 친구들에게 공유하세요.</p>

          <div style={s.field}>
            <label style={s.label}>당신의 형사 이름</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="예: 김형사"
              maxLength={8}
              style={s.input}
              autoFocus
            />
          </div>
        </div>

        <button 
          onClick={handleSubmit}
          disabled={creating || !nickname.trim()}
          style={{
            ...s.primaryBtn,
            opacity: (creating || !nickname.trim()) ? 0.5 : 1,
            cursor: (creating || !nickname.trim()) ? 'not-allowed' : 'pointer'
          }}
        >
          {creating ? '방 생성 중...' : '방 만들기 →'}
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
    minHeight: 600,
    padding: '20px',
    boxSizing: 'border-box'
  },
  header: {
    paddingBottom: 16,
    borderBottom: '0.5px solid rgba(244, 232, 208, 0.15)'
  },
  backBtn: {
    background: 'transparent',
    color: '#888780',
    border: 'none',
    padding: 0,
    fontSize: 13,
    cursor: 'pointer'
  },
  title: {
    fontSize: 18,
    fontWeight: 500,
    margin: '12px 0 0',
    textAlign: 'center'
  },
  body: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
    paddingTop: 20
  },
  guide: {
    fontSize: 13,
    color: '#888780',
    lineHeight: 1.6,
    margin: 0,
    textAlign: 'center'
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8
  },
  label: {
    fontSize: 12,
    color: '#888780',
    letterSpacing: 1
  },
  input: {
    background: '#2C2C2A',
    color: '#F4E8D0',
    border: '0.5px solid rgba(244, 232, 208, 0.25)',
    borderRadius: 8,
    padding: '14px 16px',
    fontSize: 15,
    outline: 'none'
  },
  primaryBtn: {
    background: '#FFE600',
    color: '#1A2332',
    border: 'none',
    padding: 18,
    borderRadius: 8,
    fontSize: 16,
    fontWeight: 500
  }
}
