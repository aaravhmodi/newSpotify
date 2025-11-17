import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/firebase/config'

/**
 * Validates username format
 * Username must be 3-20 characters, alphanumeric and underscores only
 */
export function validateUsernameFormat(username: string): { valid: boolean; error?: string } {
  if (!username || username.length < 3) {
    return { valid: false, error: 'Username must be at least 3 characters' }
  }
  if (username.length > 20) {
    return { valid: false, error: 'Username must be 20 characters or less' }
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { valid: false, error: 'Username can only contain letters, numbers, and underscores' }
  }
  if (username.startsWith('_') || username.endsWith('_')) {
    return { valid: false, error: 'Username cannot start or end with an underscore' }
  }
  if (username.includes('__')) {
    return { valid: false, error: 'Username cannot contain consecutive underscores' }
  }
  return { valid: true }
}

/**
 * Checks if a username is available (not taken by another user)
 */
export async function checkUsernameAvailability(username: string, excludeUid?: string): Promise<{ available: boolean; error?: string }> {
  try {
    const formatCheck = validateUsernameFormat(username)
    if (!formatCheck.valid) {
      return { available: false, error: formatCheck.error }
    }

    const lowercaseUsername = username.toLowerCase()
    const q = query(collection(db, 'users'), where('username', '==', lowercaseUsername))
    const snapshot = await getDocs(q)
    
    // Check if any user (other than the current user) has this username
    const isTaken = snapshot.docs.some(doc => doc.id !== excludeUid)
    
    if (isTaken) {
      return { available: false, error: 'This username is already taken' }
    }
    
    return { available: true }
  } catch (error: any) {
    console.error('Error checking username availability:', error)
    return { available: false, error: 'Error checking username availability' }
  }
}

