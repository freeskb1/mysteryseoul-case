// 게임 로직 헬퍼 함수들

// 인원수별 역할 구성표
export const ROLE_COMPOSITION = {
  4: { forensic: 1, murderer: 1, accomplice: 0, witness: 0, investigator: 2 },
  5: { forensic: 1, murderer: 1, accomplice: 0, witness: 0, investigator: 3 },
  6: { forensic: 1, murderer: 1, accomplice: 1, witness: 0, investigator: 3 },
  7: { forensic: 1, murderer: 1, accomplice: 1, witness: 1, investigator: 3 },
  8: { forensic: 1, murderer: 1, accomplice: 1, witness: 1, investigator: 4 },
  9: { forensic: 1, murderer: 1, accomplice: 1, witness: 1, investigator: 5 },
  10: { forensic: 1, murderer: 1, accomplice: 1, witness: 1, investigator: 6 },
  11: { forensic: 1, murderer: 1, accomplice: 1, witness: 1, investigator: 7 },
  12: { forensic: 1, murderer: 1, accomplice: 1, witness: 1, investigator: 8 }
}

// 4자리 알파벳 코드 생성
export function generateRoomCode() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let code = ''
  for (let i = 0; i < 4; i++) {
    code += letters[Math.floor(Math.random() * letters.length)]
  }
  return code
}

// 무작위 셔플
export function shuffle(array) {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// 카드 분배 + 역할 배정 — 시작 시 호스트가 호출
export function distributeCards(playerIds, options) {
  const { weapons, clues, useAccomplice, useWitness, difficulty } = options
  const playerCount = playerIds.length

  // 역할 구성 결정
  let composition = { ...ROLE_COMPOSITION[playerCount] }
  if (!useAccomplice && composition.accomplice > 0) {
    composition.investigator += composition.accomplice
    composition.accomplice = 0
  }
  if (!useWitness && composition.witness > 0) {
    composition.investigator += composition.witness
    composition.witness = 0
  }

  // 역할 풀 생성 + 셔플
  const rolePool = []
  Object.entries(composition).forEach(([roleId, count]) => {
    for (let i = 0; i < count; i++) rolePool.push(roleId)
  })
  const shuffledRoles = shuffle(rolePool)

  // 카드 풀 셔플 + 슬라이스
  const shuffledWeapons = shuffle(weapons)
  const shuffledClues = shuffle(clues)

  // 플레이어별 분배
  const distribution = {}
  playerIds.forEach((pid, i) => {
    distribution[pid] = {
      role: shuffledRoles[i],
      weapons: shuffledWeapons.slice(i * difficulty, (i + 1) * difficulty),
      clues: shuffledClues.slice(i * difficulty, (i + 1) * difficulty)
    }
  })

  return distribution
}
