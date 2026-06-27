import { PadelSession } from './types'

export function formatPrice(val: number): string {
  return `${val.toLocaleString('fa-IR')} تومان`
}

export function calculateStats(sessions: PadelSession[]) {
  let totalDuration = 0
  let totalCost = 0
  let extraCost = 0
  let gameCount = 0
  let trainingCount = 0

  sessions.forEach(session => {
    totalDuration += session.duration
    totalCost += session.totalCost
    if (session.type === 'game') gameCount++
    else trainingCount++

    session.extraItems.forEach(item => {
      extraCost += item.price
    })
  })

  return {
    totalDuration,
    totalCost,
    extraCost,
    gameCount,
    trainingCount,
    sessionCount: sessions.length
  }
}
