import { useState, useRef } from 'react'

export default function JoinScreen({ onJoin, onBack }) {
  const [code, setCode] = useState(['', '', '', ''])
  const [nickname, setNickname] = useState('')
  const [joining, setJoining] = useState(false)
  const inputRefs = [useRef(), useRef(), useRef(), useRef()]

  function handleCodeChange(i, value) {
    const upper = value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 1)
    const newCode = [...code]
    newCode[i] = upper
    setCode(newCode)
    if (upper && i < 3) {
      inputRefs[i + 1].current?.focus()
    }
  }

  function handleKeyDown(i, e) {
    if (e.key === 'Backspace' && !code[i] && i > 0) {
      inputRefs[i - 1].current?.focus()
    }
  }

  async function handleSubmit() {
    const fullCode = code.join('')
    if (fullCode.length !== 4) {
      alert('4자리 코드를 모두 입력해주세요')
      return
    }
    const trimmedNick = nickname.trim()
    if (trimmedNick.length < 1 || trimmedNick.length > 8) {
      alert('닉네임은 1~8자로 입력해주세요')
      return
    }
    setJoining(true)
    try {
      await onJoin(fullCode, trimmedNick)
    } catch (e) {
      alert('입장 실패: ' + e.message)
      setJoining(false)
    }
  }

  const canSubmit = code.join('').length === 4 && nickname.trim()

  return (
    <div style={s.wrap}>
      <div style={s.phone}>
        <div style={s.header}>
          <button onClick={onBack} style={s.backBtn}>← 뒤로</button>
          <p style={s.title}>사건 참여</p>
        </div>

        <div style={s.body}>
          <p style={s.guide}>호스트로부터 받은<br/>4자리 코드를 입력하세요</p>

          <div style={s.codeRow}>
            {code.map((c, i) => (
              <input
                key={i}
                ref={inputRefs[i]}
                type="text"
                value={c}
                onChange={(e) => handleCodeChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                maxLength={1}
                style={s.codeInput}
                autoFocus={i === 0}
              />
            ))}
          </div>

          <div style={s.field}>
            <label style={s.label}>당신의 형사 이름</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="예: 박수사"
              maxLength={8}
              style={s.input}
            />
          </div>
        </div>

        <button 
          onClick={handleSubmit}
          disabled={joining || !canSubmit}
          style={{
            ...s.primaryBtn,
            opacity: (joining || !canSubmit) ? 0.5 : 1,
            cursor: (joining || !canSubmit) ? 'not-allowed' : 'pointer'
          }}
        >
          {joining ? '입장 중...' : '입장하기 →'}
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
    padding: 20,
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
  codeRow: {
    display: 'flex',
    gap: 8,
    justifyContent: 'center'
  },
  codeInput: {
    width: 56,
    height: 64,
    background: '#2C2C2A',
    border: '0.5px solid rgba(244, 232, 208, 0.25)',
    borderRadius: 8,
    color: '#FFE600',
    textAlign: 'center',
    fontSize: 26,
    fontWeight: 500,
    outline: 'none',
    textTransform: 'uppercase'
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
