import { cookies } from 'next/headers'
import { prisma } from './db'

const JWT_SECRET = process.env.JWT_SECRET || 'development_fallback_secret_key_at_least_32_chars_long'
const JWT_HEADER = { alg: 'HS256', typ: 'JWT' }

// Base64Url encoding helper
function base64UrlEncode(str: string): string {
  return btoa(str)
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

// Base64Url decoding helper
function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  while (base64.length % 4) {
    base64 += '='
  }
  return atob(base64)
}

// Convert string to Uint8Array buffer
function stringToBuffer(str: string): Uint8Array {
  return new TextEncoder().encode(str)
}

// Import cryptographic key from secret
async function getCryptoKey(secret: string): Promise<CryptoKey> {
  const keyData = stringToBuffer(secret)
  return crypto.subtle.importKey(
    'raw',
    keyData as any,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )
}

// Sign a payload to generate a JWT token
export async function signJWT(payload: any, secret: string = JWT_SECRET): Promise<string> {
  const headerSegment = base64UrlEncode(JSON.stringify(JWT_HEADER))
  const payloadSegment = base64UrlEncode(JSON.stringify(payload))
  const dataToSign = `${headerSegment}.${payloadSegment}`
  
  const key = await getCryptoKey(secret)
  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    stringToBuffer(dataToSign) as any
  )
  
  const signatureSegment = base64UrlEncode(
    String.fromCharCode(...new Uint8Array(signatureBuffer))
  )
  
  return `${dataToSign}.${signatureSegment}`
}

// Verify and decode a JWT token
export async function verifyJWT(token: string, secret: string = JWT_SECRET): Promise<any | null> {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    
    const [headerSegment, payloadSegment, signatureSegment] = parts
    const dataToSign = `${headerSegment}.${payloadSegment}`
    
    const key = await getCryptoKey(secret)
    const signature = stringToBuffer(base64UrlDecode(signatureSegment))
    
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signature as any,
      stringToBuffer(dataToSign) as any
    )
    
    if (!isValid) return null
    
    const payload = JSON.parse(base64UrlDecode(payloadSegment))
    
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null
    }
    
    return payload
  } catch (error) {
    return null
  }
}

export interface AuthenticatedUser {
  id: string
  username: string
  createdAt: Date
  updatedAt: Date
}

// Server helper to retrieve the logged-in user
export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('session')?.value
    if (!token) return null

    const payload = await verifyJWT(token)
    if (!payload || !payload.userId) return null

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        username: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return user
  } catch (error) {
    return null
  }
}
