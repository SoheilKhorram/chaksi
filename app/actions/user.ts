'use server'

import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { getAuthenticatedUser, signJWT } from '@/lib/auth'

export interface ActionResponse {
  success: boolean
  error?: string
}

// Whitelist of valid avatars based on the files in public/avatars/
const VALID_AVATARS = [
  'cat.png',
  'duck.png',
  'elephant.png',
  'fox.png',
  'frog-.png',
  'gorilla.png',
  'hen.png',
  'hippopotamus.png',
  'horse.png',
  'penguin.png',
  'rabbit.png',
  'shark.png',
]

/**
 * Server Action to update user settings
 */
export async function updateUserSettingsAction(formData: FormData): Promise<ActionResponse> {
  try {
    // 1. Authenticate user
    const currentUser = await getAuthenticatedUser()
    if (!currentUser) {
      return { success: false, error: 'کاربر احراز هویت نشده است. لطفاً دوباره وارد شوید.' }
    }

    const username = formData.get('username') as string | null
    const avatar = formData.get('avatar') as string | null
    const password = formData.get('password') as string | null
    const confirmPassword = formData.get('confirmPassword') as string | null

    // 2. Validate Username
    if (!username || username.trim().length === 0) {
      return { success: false, error: 'نام کاربری نمی‌تواند خالی باشد.' }
    }

    const cleanUsername = username.trim()
    if (cleanUsername.length < 3) {
      return { success: false, error: 'نام کاربری باید حداقل ۳ کاراکتر باشد.' }
    }

    // 3. Validate Avatar
    if (!avatar || !VALID_AVATARS.includes(avatar)) {
      return { success: false, error: 'آواتار انتخاب شده نامعتبر است.' }
    }

    // 4. Validate Password (if provided)
    let hashedPasswordToUpdate: string | undefined = undefined
    if (password && password.length > 0) {
      if (password.length < 6) {
        return { success: false, error: 'رمز عبور جدید باید حداقل ۶ کاراکتر باشد.' }
      }
      if (password !== confirmPassword) {
        return { success: false, error: 'رمز عبور جدید و تکرار آن مطابقت ندارند.' }
      }
      hashedPasswordToUpdate = await bcrypt.hash(password, 10)
    }

    // 5. Check if username is already taken by another user
    if (cleanUsername.toLowerCase() !== currentUser.username.toLowerCase()) {
      const existingUser = await prisma.user.findUnique({
        where: { username: cleanUsername }
      })
      if (existingUser) {
        return { success: false, error: 'این نام کاربری قبلاً انتخاب شده است.' }
      }
    }

    // 6. Update user in the database
    const updateData: any = {
      username: cleanUsername,
      avatar: avatar,
    }

    if (hashedPasswordToUpdate) {
      updateData.password = hashedPasswordToUpdate
    }

    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: updateData,
    })

    // 7. Re-sign session JWT with updated username and save cookie if username changed
    if (cleanUsername !== currentUser.username) {
      const token = await signJWT({
        userId: updatedUser.id,
        username: updatedUser.username,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 // 7 days
      })

      const cookieStore = await cookies()
      cookieStore.set('session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/'
      })
    }

    return { success: true }
  } catch (error) {
    console.error('Update settings error:', error)
    return { success: false, error: 'یک خطای غیرمنتظره در حین ذخیره تنظیمات رخ داد.' }
  }
}
