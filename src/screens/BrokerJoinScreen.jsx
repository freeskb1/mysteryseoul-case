import { useState, useRef } from 'react'

export default function BrokerJoinScreen({ onJoin, onBack }) {
  const [code, setCode] = useState(['', '', '', ''])
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
    setJoining(true)
    try {
      await onJoin(fullCode)
    } catch (e) {
      alert('입장 실패: ' + e.message)
      setJoining(false)
    }
  }

  return (
    <div style={s.wrap}>
      <div style={s.box}>
        <div style={s.header}>
          <button onClick={onBack} style={s.backBtn}>← 뒤로</button>
          <p style={s.brand}>🖥 BROKER MODE</p>
          <p style={s.title}>중계 화면 등록</p>
        </div>

        <div style={s.body}>
          <p style={s.guide}>
            큰 화면 모드입니다.<br/>
            게임 진행 중 모두가 보는 메인 보드 역할을 합니다.<br/>
            <span style={s.warn}>⚠️ 한 방에 1대만 등록 가능</span>
          </p>

          <div>
            <p style={s.codeLabel}>호스트로부터 받은 4자리 사건 코드</p>
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
          </div>
        </div>

        <button 
          onClick={handleSubmit}
          disabled={joining || code.join('').length !== 4}
          style={{
            ...s.primaryBtn,
            opacity: (joining || code.join('').length !== 4) ? 0.5 : 1,
            cursor: (joining || code.join('').length !== 4) ? 'not-allowed' : 'pointer'
          }}
        >
          {joining ? '등록 중...' : '중계 화면으로 등록 →'}
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
  box: {
    width: '100%',
    maxWidth: 480,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    padding: 28,
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
  brand: {
    fontSize: 11,
    letterSpacing: 3,
    color: '#FFE600',
    margin: '14px 0 4px',
    textAlign: 'center'
  },
  title: {
    fontSize: 22,
    fontWeight: 500,
    margin: 0,
    textAlign: 'center'
  },
  body: {
    display: 'flex',
    flexDirection: 'column',
    gap: 28,
    paddingTop: 24
  },
  guide: {
    fontSize: 13,
    color: '#888780',
    lineHeight: 1.7,
    margin: 0,
    textAlign: 'center'
  },
  warn: {
    color: '#FFE600',
    fontSize: 12
  },
  codeLabel: {
    fontSize: 12,
    color: '#888780',
    letterSpacing: 1,
    margin: '0 0 12px',
    textAlign: 'center'
  },
  codeRow: {
    display: 'flex',
    gap: 10,
    justifyContent: 'center'
  },
  codeInput: {
    width: 64,
    height: 76,
    background: '#2C2C2A',
    border: '0.5px solid rgba(244, 232, 208, 0.25)',
    borderRadius: 10,
    color: '#FFE600',
    textAlign: 'center',
    fontSize: 32,
    fontWeight: 500,
    outline: 'none',
    textTransform: 'uppercase'
  },
  primaryBtn: {
    background: '#FFE600',
    color: '#1A2332',
    border: 'none',
    padding: 18,
    borderRadius: 8,
    fontSize: 16,
    fontWeight: 500,
    marginTop: 12
  }
}
