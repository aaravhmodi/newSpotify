'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from '@/firebase/config'
import { useAuth } from '@/hooks/useAuth'
import Button from '@/components/Button'
import Input from '@/components/Input'
import BackButton from '@/components/BackButton'

const ADMIN_ACCESS_CODE = 'Matei2025'

export default function AdminLoginPage() {
  const [adminAccessCode, setAdminAccessCode] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { user, userData, loading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // If user is already logged in and is admin, redirect to admin dashboard
    if (!authLoading && user && userData && userData.role === 'admin') {
      router.push('/admin')
    }
  }, [user, userData, authLoading, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Verify admin access code
      if (adminAccessCode !== ADMIN_ACCESS_CODE) {
        setError('Invalid admin access code')
        setIsLoading(false)
        return
      }

      // Check if user is logged in
      if (!user) {
        setError('Please log in with your regular account first, then return here and enter the access code.')
        setIsLoading(false)
        return
      }

      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid))
      
      if (!userDoc.exists()) {
        // Create admin user document
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          role: 'admin',
          fullName: 'Ms Matei',
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      } else {
        // Update existing user to admin role
        const currentUserData = userDoc.data()
        await setDoc(doc(db, 'users', user.uid), {
          ...currentUserData,
          role: 'admin',
          fullName: 'Ms Matei',
          updatedAt: new Date(),
        }, { merge: true })
      }

      router.push('/admin')
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate as admin')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg">
        <div className="mb-4">
          <BackButton href="/login" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-center text-gray-900">Admin Login</h1>
          <p className="mt-2 text-center text-gray-600">CPSS Connect Admin Portal</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {!user && (
              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm">
                Please log in with your regular account first, then return here and enter the admin access code.
              </div>
            )}
            
            <Input
              label="Admin Access Code"
              type="password"
              value={adminAccessCode}
              onChange={(e) => setAdminAccessCode(e.target.value)}
              required
              placeholder="Enter admin code"
            />
          </div>

          <Button type="submit" isLoading={isLoading} className="w-full">
            Sign In as Admin
          </Button>

          <div className="text-center">
            <a href="/login" className="text-sm text-gray-500 hover:text-gray-700">
              Back to regular login
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}

