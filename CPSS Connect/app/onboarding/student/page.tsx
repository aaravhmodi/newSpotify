'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase/config'
import Button from '@/components/Button'
import Input from '@/components/Input'
import Textarea from '@/components/Textarea'
import BackButton from '@/components/BackButton'
import { checkUsernameAvailability, validateUsernameFormat } from '@/lib/username'

export default function StudentOnboardingPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    gradYear: '',
    gradMonth: '',
    interestedPrograms: '',
    bio: '',
  })
  const [error, setError] = useState('')
  const [usernameError, setUsernameError] = useState('')
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!user) return

    if (!formData.username || !formData.fullName || !formData.gradYear || !formData.gradMonth) {
      setError('Please fill in all required fields')
      return
    }

    // Validate and check username availability
    setUsernameError('')
    setIsCheckingUsername(true)
    const usernameCheck = await checkUsernameAvailability(formData.username)
    setIsCheckingUsername(false)
    
    if (!usernameCheck.available) {
      setUsernameError(usernameCheck.error || 'Username is not available')
      return
    }

    setIsSubmitting(true)

    try {
      const programs = formData.interestedPrograms
        .split(',')
        .map(p => p.trim())
        .filter(p => p.length > 0)

      const userData = {
        uid: user.uid,
        email: user.email,
        role: 'student',
        username: formData.username.toLowerCase().trim(),
        fullName: formData.fullName,
        gradYear: parseInt(formData.gradYear),
        gradMonth: parseInt(formData.gradMonth),
        interestedPrograms: programs,
        bio: formData.bio || '',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      console.log('Creating student profile:', { uid: user.uid, email: user.email })
      
      await setDoc(doc(db, 'users', user.uid), userData)
      
      console.log('Student profile created successfully')
      
      // Verify the document was created
      const verifyDoc = await getDoc(doc(db, 'users', user.uid))
      if (!verifyDoc.exists()) {
        throw new Error('Profile was not created. Please try again.')
      }
      
      router.push('/home')
    } catch (err: any) {
      console.error('Error creating student profile:', err)
      const errorMessage = err.code === 'permission-denied' 
        ? 'Permission denied. Please check Firestore rules.'
        : err.message || 'Failed to create profile'
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

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
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <div className="mb-6">
          <BackButton href="/select-role" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Profile Setup</h1>
        <p className="text-gray-600 mb-8">Tell us about yourself</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <Input
              label="Username"
              value={formData.username}
              onChange={(e) => {
                const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')
                setFormData({ ...formData, username: value })
                setUsernameError('')
              }}
              required
              placeholder="johndoe"
              maxLength={20}
            />
            {usernameError && (
              <p className="mt-1 text-sm text-red-600">{usernameError}</p>
            )}
            {!usernameError && formData.username && (
              <p className="mt-1 text-sm text-gray-500">
                3-20 characters, letters, numbers, and underscores only
              </p>
            )}
          </div>

          <Input
            label="Full Name"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            required
            placeholder="John Doe"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Graduation Year"
              type="number"
              value={formData.gradYear}
              onChange={(e) => setFormData({ ...formData, gradYear: e.target.value })}
              required
              placeholder="2026"
              min="2024"
              max="2030"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Graduation Month
              </label>
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={formData.gradMonth}
                onChange={(e) => setFormData({ ...formData, gradMonth: e.target.value })}
                required
              >
                <option value="">Select month</option>
                <option value="1">January</option>
                <option value="2">February</option>
                <option value="3">March</option>
                <option value="4">April</option>
                <option value="5">May</option>
                <option value="6">June</option>
                <option value="7">July</option>
                <option value="8">August</option>
                <option value="9">September</option>
                <option value="10">October</option>
                <option value="11">November</option>
                <option value="12">December</option>
              </select>
            </div>
          </div>

          <Input
            label="Interested Programs (comma-separated)"
            value={formData.interestedPrograms}
            onChange={(e) => setFormData({ ...formData, interestedPrograms: e.target.value })}
            placeholder="Computer Engineering, Nursing, Business"
          />

          <Textarea
            label="Bio"
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            rows={4}
            placeholder="Tell us a bit about yourself..."
          />

          <Button type="submit" isLoading={isSubmitting} className="w-full">
            Complete Setup
          </Button>
        </form>
      </div>
    </div>
  )
}

