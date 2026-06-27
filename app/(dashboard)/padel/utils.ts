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

// Converts Persian digits to English digits
export function persianToEnglishDigits(str: string): string {
  const persianDigits = [/۰/g, /۱/g, /۲/g, /۳/g, /۴/g, /۵/g, /۶/g, /۷/g, /۸/g, /۹/g]
  let result = str
  for (let i = 0; i < 10; i++) {
    result = result.replace(persianDigits[i], String(i))
  }
  return result
}

// Formats a raw numeric string with thousands separator (commas)
export function formatInputNumber(value: string | number | undefined | null): string {
  if (value === undefined || value === null || value === '') return ''
  const englishDigits = persianToEnglishDigits(value.toString())
  // Remove anything that is not a digit
  const cleanValue = englishDigits.replace(/\D/g, '')
  if (!cleanValue) return ''
  return Number(cleanValue).toLocaleString('en-US')
}

// Parses a formatted string back to a number
export function parseInputNumber(value: string | undefined | null): number {
  if (!value) return 0
  const englishDigits = persianToEnglishDigits(value)
  const cleanValue = englishDigits.replace(/\D/g, '')
  return cleanValue ? parseInt(cleanValue, 10) : 0
}
