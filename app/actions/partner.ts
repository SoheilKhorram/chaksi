'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { getAuthenticatedUser } from '@/lib/auth'
import { ActionResponse } from './auth'

/**
 * Sends a partner request to a user by their ID.
 */
export async function sendPartnerRequestAction(
  receiverId: string
): Promise<ActionResponse> {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return { success: false, error: 'عدم دسترسی معتبر. لطفا مجددا وارد شوید.' }
    }

    const cleanReceiverId = receiverId.trim()
    if (!cleanReceiverId) {
      return { success: false, error: 'کد هم‌تیمی الزامی است.' }
    }

    if (!/^[A-Za-z0-9]{6}$/.test(cleanReceiverId)) {
      return { success: false, error: 'کد هم‌تیمی باید یک شناسه ۶ کاراکتری شامل حروف و اعداد باشد.' }
    }

    if (cleanReceiverId === user.displayId) {
      return { success: false, error: 'شما نمی‌توانید به خودتان درخواست هم‌تیمی بدهید!' }
    }

    // Check if receiver user exists
    const receiver = await prisma.user.findUnique({
      where: { displayId: cleanReceiverId }
    })

    if (!receiver) {
      return { success: false, error: 'کاربری با این کد یافت نشد.' }
    }

    // Check existing request
    const existing = await prisma.partnerRequest.findFirst({
      where: {
        OR: [
          { senderId: user.id, receiverId: receiver.id },
          { senderId: receiver.id, receiverId: user.id }
        ]
      }
    })

    if (existing) {
      if (existing.status === 'ACCEPTED') {
        return { success: false, error: 'شما در حال حاضر با این کاربر هم‌تیمی هستید.' }
      }
      if (existing.senderId === user.id) {
        return { success: false, error: 'درخواست هم‌تیمی قبلاً برای این کاربر ارسال شده است و منتظر تایید است.' }
      }
      if (existing.senderId === receiver.id) {
        // Automatically accept the request if it exists in the other direction!
        await acceptPartnerRequestAction(existing.id)
        return { success: true, error: undefined } // Indicates success (and auto-accepted)
      }
    }

    // Create the request
    await prisma.partnerRequest.create({
      data: {
        senderId: user.id,
        receiverId: receiver.id,
        status: 'PENDING'
      }
    })

    revalidatePath('/padel')
    return { success: true }
  } catch (err) {
    console.error('Send partner request error:', err)
    return { success: false, error: 'ارسال درخواست هم‌تیمی ناموفق بود.' }
  }
}

/**
 * Accepts a received partner request.
 */
export async function acceptPartnerRequestAction(
  requestId: string
): Promise<ActionResponse> {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return { success: false, error: 'عدم دسترسی معتبر.' }
    }

    const request = await prisma.partnerRequest.findUnique({
      where: { id: requestId }
    })

    if (!request || request.receiverId !== user.id) {
      return { success: false, error: 'درخواست معتبری یافت نشد.' }
    }

    // 1. Terminate any existing active partnerships for both users (enforcing 1-to-1)
    await prisma.partnerRequest.deleteMany({
      where: {
        OR: [
          { senderId: user.id },
          { receiverId: user.id },
          { senderId: request.senderId },
          { receiverId: request.senderId }
        ],
        status: 'ACCEPTED'
      }
    })

    // 2. Set this request status to ACCEPTED
    await prisma.partnerRequest.update({
      where: { id: requestId },
      data: { status: 'ACCEPTED' }
    })

    revalidatePath('/padel')
    return { success: true }
  } catch (err) {
    console.error('Accept partner request error:', err)
    return { success: false, error: 'تایید درخواست هم‌تیمی ناموفق بود.' }
  }
}

/**
 * Declines or cancels a partner request.
 */
export async function declinePartnerRequestAction(
  requestId: string
): Promise<ActionResponse> {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return { success: false, error: 'عدم دسترسی معتبر.' }
    }

    const request = await prisma.partnerRequest.findUnique({
      where: { id: requestId }
    })

    if (!request || (request.senderId !== user.id && request.receiverId !== user.id)) {
      return { success: false, error: 'دسترسی غیرمجاز یا درخواست یافت نشد.' }
    }

    await prisma.partnerRequest.delete({
      where: { id: requestId }
    })

    revalidatePath('/padel')
    return { success: true }
  } catch (err) {
    console.error('Decline partner request error:', err)
    return { success: false, error: 'رد درخواست ناموفق بود.' }
  }
}

/**
 * Disconnects the current active partnership.
 */
export async function disconnectPartnerAction(): Promise<ActionResponse> {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return { success: false, error: 'عدم دسترسی معتبر.' }
    }

    await prisma.partnerRequest.deleteMany({
      where: {
        OR: [
          { senderId: user.id },
          { receiverId: user.id }
        ],
        status: 'ACCEPTED'
      }
    })

    revalidatePath('/padel')
    return { success: true }
  } catch (err) {
    console.error('Disconnect partner error:', err)
    return { success: false, error: 'قطع ارتباط با هم‌تیمی ناموفق بود.' }
  }
}
