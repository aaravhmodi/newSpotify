'use client'

import { useState, useEffect } from 'react'
import { User as FirebaseUser, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { auth, db } from '@/firebase/config'
import { User } from '@/lib/types'
import { checkAutoGraduation } from '@/lib/utils'

export function useAuth() {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [userData, setUserData] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      
      if (firebaseUser) {
        // Fetch user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
        
        if (userDoc.exists()) {
          let userData = { ...userDoc.data(), uid: firebaseUser.uid } as User
          
          // Check auto-graduation
          if (checkAutoGraduation(userData)) {
            await updateDoc(doc(db, 'users', firebaseUser.uid), {
              role: 'alumni',
              updatedAt: new Date(),
            })
            userData = { ...userData, role: 'alumni' }
          }
          
          setUserData(userData)
        } else {
          setUserData(null)
        }
      } else {
        setUserData(null)
      }
      
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signOut = async () => {
    await firebaseSignOut(auth)
    setUser(null)
    setUserData(null)
  }

  return { user, userData, loading, signOut }
}

