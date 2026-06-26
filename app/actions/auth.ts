'use server'

import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { signJWT } from '@/lib/auth'

export interface ActionResponse {
  success: boolean
  error?: string
}

/**
 * Server Action for User Signup
 */
export async function signupAction(formData: FormData): Promise<ActionResponse> {
  const username = formData.get('username') as string | null
  const password = formData.get('password') as string | null
  const confirmPassword = formData.get('confirmPassword') as string | null

  if (!username || !password || !confirmPassword) {
    return { success: false, error: 'همه فیلدها الزامی هستند.' }
  }

  if (username.length < 3) {
    return { success: false, error: 'نام کاربری باید حداقل ۳ کاراکتر باشد.' }
  }

  if (password.length < 6) {
    return { success: false, error: 'رمز عبور باید حداقل ۶ کاراکتر باشد.' }
  }

  if (password !== confirmPassword) {
    return { success: false, error: 'رمزهای عبور با هم مطابقت ندارند.' }
  }

  try {
    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username: username.trim() }
    })

    if (existingUser) {
      return { success: false, error: 'این نام کاربری قبلاً انتخاب شده است.' }
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Save user to the database
    await prisma.user.create({
      data: {
        username: username.trim(),
        password: hashedPassword
      }
    })

    return { success: true }
  } catch (err) {
    console.error('Signup error:', err)
    return { success: false, error: 'یک خطای غیرمنتظره در حین ثبت‌نام رخ داد.' }
  }
}

/**
 * Server Action for User Login
 */
export async function loginAction(formData: FormData): Promise<ActionResponse> {
  const username = formData.get('username') as string | null
  const password = formData.get('password') as string | null

  if (!username || !password) {
    return { success: false, error: 'همه فیلدها الزامی هستند.' }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { username: username.trim() }
    })

    if (!user) {
      return { success: false, error: 'نام کاربری یا رمز عبور نامعتبر است.' }
    }

    const passwordsMatch = await bcrypt.compare(password, user.password)
    if (!passwordsMatch) {
      return { success: false, error: 'نام کاربری یا رمز عبور نامعتبر است.' }
    }

    // Create session token (expires in 7 days)
    const token = await signJWT({
      userId: user.id,
      username: user.username,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 // 7 days
    })

    // Set cookie on server-side
    const cookieStore = await cookies()
    cookieStore.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/'
    })

    return { success: true }
  } catch (err) {
    console.error('Login error:', err)
    return { success: false, error: 'یک خطای غیرمنتظره در حین ورود رخ داد.' }
  }
}

/**
 * Server Action for Logging Out
 */
export async function logoutAction(): Promise<ActionResponse> {
  try {
    const cookieStore = await cookies()
    cookieStore.delete('session')
    return { success: true }
  } catch (err) {
    console.error('Logout error:', err)
    return { success: false, error: 'یک خطای غیرمنتظره در حین خروج رخ داد.' }
  }
}
