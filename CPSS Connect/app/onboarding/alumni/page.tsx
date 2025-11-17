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

export default function AlumniOnboardingPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    classOf: '',
    universityClassOf: '',
    university: '',
    program: '',
    jobTitle: '',
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

    if (!formData.username || !formData.fullName || !formData.classOf || !formData.universityClassOf || !formData.university) {
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
      const userData = {
        uid: user.uid,
        email: user.email,
        role: 'alumni',
        username: formData.username.toLowerCase().trim(),
        fullName: formData.fullName,
        classOf: parseInt(formData.classOf),
        universityClassOf: parseInt(formData.universityClassOf),
        university: formData.university,
        program: formData.program || '',
        jobTitle: formData.jobTitle || '',
        bio: formData.bio || '',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      console.log('Creating alumni profile:', { uid: user.uid, email: user.email })
      
      await setDoc(doc(db, 'users', user.uid), userData)
      
      console.log('Alumni profile created successfully')
      
      // Verify the document was created
      const verifyDoc = await getDoc(doc(db, 'users', user.uid))
      if (!verifyDoc.exists()) {
        throw new Error('Profile was not created. Please try again.')
      }
      
      router.push('/home')
    } catch (err: any) {
      console.error('Error creating alumni profile:', err)
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Alumni Profile Setup</h1>
        <p className="text-gray-600 mb-8">Tell us about your journey</p>

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
              placeholder="janesmith"
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
            placeholder="Jane Smith"
          />

          <Input
            label="Class of (High School Graduation Year)"
            type="number"
            value={formData.classOf}
            onChange={(e) => setFormData({ ...formData, classOf: e.target.value })}
            required
            placeholder="2024"
            min="2000"
            max="2030"
          />

          <Input
            label="Class of (University Graduation Year)"
            type="number"
            value={formData.universityClassOf}
            onChange={(e) => setFormData({ ...formData, universityClassOf: e.target.value })}
            required
            placeholder="2028"
            min="2000"
            max="2035"
          />

          <Input
            label="University/College or Workplace"
            value={formData.university}
            onChange={(e) => setFormData({ ...formData, university: e.target.value })}
            required
            placeholder="University of Toronto"
          />

          <Input
            label="Program/Major"
            value={formData.program}
            onChange={(e) => setFormData({ ...formData, program: e.target.value })}
            placeholder="Computer Science (optional)"
          />

          <Input
            label="Current Career/Job Title"
            value={formData.jobTitle}
            onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
            placeholder="Software Engineer (optional)"
          />

          <Textarea
            label="Bio"
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            rows={4}
            placeholder="Share your experience and what you're up to now..."
          />

          <Button type="submit" isLoading={isSubmitting} className="w-full">
            Complete Setup
          </Button>
        </form>
      </div>
    </div>
  )
}

