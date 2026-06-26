'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { getAuthenticatedUser } from '@/lib/auth'
import { ActionResponse } from './auth'

export interface ExtraItem {
  name: string
  price: number
}

export interface PadelSessionInput {
  date: string
  duration: number
  players: string
  type: 'game' | 'training'
  customPrice?: number | null
  extraItems: ExtraItem[]
}

/**
 * Saves default game and training prices for a user.
 */
export async function savePadelSettingsAction(
  gamePrice: number,
  trainingPrice: number
): Promise<ActionResponse> {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return { success: false, error: 'عدم دسترسی معتبر.' }
    }

    await prisma.padelSettings.upsert({
      where: { userId: user.id },
      update: {
        gamePrice: Number(gamePrice),
        trainingPrice: Number(trainingPrice),
      },
      create: {
        userId: user.id,
        gamePrice: Number(gamePrice),
        trainingPrice: Number(trainingPrice),
      },
    })

    revalidatePath('/padel')
    return { success: true }
  } catch (err) {
    console.error('Save settings error:', err)
    return { success: false, error: 'ذخیره تنظیمات ناموفق بود.' }
  }
}

/**
 * Logs a new padel session.
 */
export async function createPadelSessionAction(
  input: PadelSessionInput
): Promise<ActionResponse> {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return { success: false, error: 'عدم دسترسی معتبر.' }
    }

    const { date, duration, players, type, customPrice, extraItems } = input

    if (!date || !duration || !type) {
      return { success: false, error: 'اطلاعات ضروری جلسه وارد نشده است.' }
    }

    // Determine the base price of the session itself
    let basePrice = 0
    if (customPrice !== undefined && customPrice !== null) {
      basePrice = Number(customPrice)
    } else {
      const settings = await prisma.padelSettings.findUnique({
        where: { userId: user.id },
      })
      const hourlyRate = type === 'game' ? (settings?.gamePrice ?? 0) : (settings?.trainingPrice ?? 0)
      basePrice = Number(duration) * hourlyRate
    }

    // Calculate extra items total cost
    const extraItemsCost = extraItems.reduce(
      (sum, item) => sum + (Number(item.price) || 0),
      0
    )
    const totalCost = basePrice + extraItemsCost

    await prisma.padelSession.create({
      data: {
        userId: user.id,
        date: new Date(date),
        duration: Number(duration),
        players: players.trim(),
        type: type,
        price: basePrice,
        extraItems: extraItems as any, // Cast as prisma Json
        totalCost: totalCost,
      },
    })

    revalidatePath('/padel')
    return { success: true }
  } catch (err) {
    console.error('Create session error:', err)
    return { success: false, error: 'ثبت جلسه پدل ناموفق بود.' }
  }
}

/**
 * Deletes an existing padel session.
 */
export async function deletePadelSessionAction(
  sessionId: string
): Promise<ActionResponse> {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return { success: false, error: 'عدم دسترسی معتبر.' }
    }

    const session = await prisma.padelSession.findUnique({
      where: { id: sessionId },
    })

    if (!session || session.userId !== user.id) {
      return { success: false, error: 'جلسه یافت نشد یا دسترسی رد شد.' }
    }

    await prisma.padelSession.delete({
      where: { id: sessionId },
    })

    revalidatePath('/padel')
    return { success: true }
  } catch (err) {
    console.error('Delete session error:', err)
    return { success: false, error: 'حذف جلسه پدل ناموفق بود.' }
  }
}
