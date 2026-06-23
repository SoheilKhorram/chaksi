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
    return { success: false, error: 'All fields are required.' }
  }

  if (username.length < 3) {
    return { success: false, error: 'Username must be at least 3 characters long.' }
  }

  if (password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters long.' }
  }

  if (password !== confirmPassword) {
    return { success: false, error: 'Passwords do not match.' }
  }

  try {
    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username: username.trim() }
    })

    if (existingUser) {
      return { success: false, error: 'Username is already taken.' }
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
    return { success: false, error: 'An unexpected error occurred during signup.' }
  }
}

/**
 * Server Action for User Login
 */
export async function loginAction(formData: FormData): Promise<ActionResponse> {
  const username = formData.get('username') as string | null
  const password = formData.get('password') as string | null

  if (!username || !password) {
    return { success: false, error: 'All fields are required.' }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { username: username.trim() }
    })

    if (!user) {
      return { success: false, error: 'Invalid username or password.' }
    }

    const passwordsMatch = await bcrypt.compare(password, user.password)
    if (!passwordsMatch) {
      return { success: false, error: 'Invalid username or password.' }
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
    return { success: false, error: 'An unexpected error occurred during login.' }
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
    return { success: false, error: 'An unexpected error occurred during logout.' }
  }
}
