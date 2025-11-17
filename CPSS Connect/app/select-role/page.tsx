'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import Button from '@/components/Button'
import BackButton from '@/components/BackButton'

export default function SelectRolePage() {
  const { user, userData, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    } else if (!loading && userData) {
      router.push('/home')
    }
  }, [user, userData, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg">
        <div className="mb-4">
          <BackButton href="/login" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-center text-gray-900">Choose Your Role</h1>
          <p className="mt-2 text-center text-gray-600">Select how you'd like to join CPSS Connect</p>
        </div>

        <div className="space-y-4 mt-8">
          <Button
            variant="primary"
            className="w-full py-4 text-lg"
            onClick={() => router.push('/onboarding/student')}
          >
            Current Student
          </Button>

          <Button
            variant="primary"
            className="w-full py-4 text-lg"
            onClick={() => router.push('/onboarding/alumni')}
          >
            Alumni
          </Button>
        </div>

        <div className="text-center pt-4 border-t">
          <p className="text-sm text-gray-500">
            Admin?{' '}
            <a href="/admin/login" className="text-primary hover:underline font-medium">
              Click here to login
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

