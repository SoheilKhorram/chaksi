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
  sendToPartner?: boolean
  isPaid?: boolean
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

    const { date, duration, players, type, customPrice, extraItems, sendToPartner } = input

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
      const hourlyRate = type === 'game' ? (settings?.gamePrice ?? 250000) : (settings?.trainingPrice ?? 800000)
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
        isPaid: input.isPaid ?? false,
      },
    })

    if (sendToPartner) {
      const activePartnership = await prisma.partnerRequest.findFirst({
        where: {
          status: 'ACCEPTED',
          OR: [
            { senderId: user.id },
            { receiverId: user.id }
          ]
        }
      })

      if (activePartnership) {
        const partnerId = activePartnership.senderId === user.id ? activePartnership.receiverId : activePartnership.senderId
        
        // Determine the partner's session price using the partner's default settings
        let partnerPrice = 0
        if (customPrice !== undefined && customPrice !== null) {
          partnerPrice = Number(customPrice)
        } else {
          const partnerSettings = await prisma.padelSettings.findUnique({
            where: { userId: partnerId },
          })
          const hourlyRate = type === 'game' 
            ? (partnerSettings?.gamePrice ?? 250000) 
            : (partnerSettings?.trainingPrice ?? 800000)
          partnerPrice = Number(duration) * hourlyRate
        }

        await prisma.sharedSession.create({
          data: {
            senderId: user.id,
            receiverId: partnerId,
            date: new Date(date),
            duration: Number(duration),
            players: players.trim(),
            type: type,
            price: partnerPrice,
            extraItems: extraItems as any,
          }
        })
      }
    }

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

/**
 * Updates an existing padel session.
 */
export async function updatePadelSessionAction(
  sessionId: string,
  input: PadelSessionInput
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
      const hourlyRate = type === 'game' ? (settings?.gamePrice ?? 250000) : (settings?.trainingPrice ?? 800000)
      basePrice = Number(duration) * hourlyRate
    }

    // Calculate extra items total cost
    const extraItemsCost = extraItems.reduce(
      (sum, item) => sum + (Number(item.price) || 0),
      0
    )
    const totalCost = basePrice + extraItemsCost

    await prisma.padelSession.update({
      where: { id: sessionId },
      data: {
        date: new Date(date),
        duration: Number(duration),
        players: players.trim(),
        type: type,
        price: basePrice,
        extraItems: extraItems as any, // Cast as prisma Json
        totalCost: totalCost,
        isPaid: input.isPaid,
      },
    })

    revalidatePath('/padel')
    return { success: true }
  } catch (err) {
    console.error('Update session error:', err)
    return { success: false, error: 'ویرایش جلسه پدل ناموفق بود.' }
  }
}

/**
 * Accepts a received shared session.
 */
export async function acceptSharedSessionAction(
  sharedSessionId: string
): Promise<ActionResponse> {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return { success: false, error: 'عدم دسترسی معتبر.' }
    }

    const sharedSession = await prisma.sharedSession.findUnique({
      where: { id: sharedSessionId }
    })

    if (!sharedSession || sharedSession.receiverId !== user.id) {
      return { success: false, error: 'جلسه پیشنهادی یافت نشد.' }
    }

    const basePrice = sharedSession.price
    const extraItems = Array.isArray(sharedSession.extraItems) ? sharedSession.extraItems : []
    const extraItemsCost = extraItems.reduce(
      (sum: number, item: any) => sum + (Number(item.price) || 0),
      0
    )
    const totalCost = basePrice + extraItemsCost

    await prisma.$transaction([
      prisma.padelSession.create({
        data: {
          userId: user.id,
          date: sharedSession.date,
          duration: sharedSession.duration,
          players: sharedSession.players,
          type: sharedSession.type,
          price: basePrice,
          extraItems: sharedSession.extraItems as any,
          totalCost: totalCost,
        }
      }),
      prisma.sharedSession.delete({
        where: { id: sharedSessionId }
      })
    ])

    revalidatePath('/padel')
    return { success: true }
  } catch (err) {
    console.error('Accept shared session error:', err)
    return { success: false, error: 'افزودن جلسه ناموفق بود.' }
  }
}

/**
 * Declines or dismisses a shared session.
 */
export async function declineSharedSessionAction(
  sharedSessionId: string
): Promise<ActionResponse> {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return { success: false, error: 'عدم دسترسی معتبر.' }
    }

    const sharedSession = await prisma.sharedSession.findUnique({
      where: { id: sharedSessionId }
    })

    if (!sharedSession || sharedSession.receiverId !== user.id) {
      return { success: false, error: 'جلسه پیشنهادی یافت نشد.' }
    }

    await prisma.sharedSession.delete({
      where: { id: sharedSessionId }
    })

    revalidatePath('/padel')
    return { success: true }
  } catch (err) {
    console.error('Decline shared session error:', err)
    return { success: false, error: 'رد درخواست جلسه ناموفق بود.' }
  }
}

/**
 * Toggles the paid status of a padel session.
 */
export async function togglePadelSessionPaidAction(
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

    await prisma.padelSession.update({
      where: { id: sessionId },
      data: {
        isPaid: !session.isPaid,
      },
    })

    revalidatePath('/padel')
    return { success: true }
  } catch (err) {
    console.error('Toggle paid status error:', err)
    return { success: false, error: 'تغییر وضعیت پرداخت ناموفق بود.' }
  }
}

/**
 * Marks padel sessions within a date range as paid.
 */
export async function markSessionsPaidInRangeAction(
  startDateStr: string,
  endDateStr: string
): Promise<ActionResponse> {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return { success: false, error: 'عدم دسترسی معتبر.' }
    }

    if (!startDateStr || !endDateStr) {
      return { success: false, error: 'تاریخ شروع و پایان الزامی است.' }
    }

    const startDate = new Date(startDateStr)
    startDate.setHours(0, 0, 0, 0)
    const endDate = new Date(endDateStr)
    endDate.setHours(23, 59, 59, 999)

    await prisma.padelSession.updateMany({
      where: {
        userId: user.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
        isPaid: false,
      },
      data: {
        isPaid: true,
      },
    })

    revalidatePath('/padel')
    return { success: true }
  } catch (err) {
    console.error('Bulk mark sessions paid error:', err)
    return { success: false, error: 'ثبت تسویه حساب ناموفق بود.' }
  }
}

/**
 * Marks all unpaid padel sessions as paid for the user.
 */
export async function markAllSessionsPaidAction(): Promise<ActionResponse> {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return { success: false, error: 'عدم دسترسی معتبر.' }
    }

    await prisma.padelSession.updateMany({
      where: {
        userId: user.id,
        isPaid: false,
      },
      data: {
        isPaid: true,
      },
    })

    revalidatePath('/padel')
    return { success: true }
  } catch (err) {
    console.error('Mark all sessions paid error:', err)
    return { success: false, error: 'ثبت تسویه حساب کامل ناموفق بود.' }
  }
}


