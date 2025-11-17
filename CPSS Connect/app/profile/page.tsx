'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@/firebase/config'
import Navigation from '@/components/Navigation'
import Button from '@/components/Button'
import Input from '@/components/Input'
import Textarea from '@/components/Textarea'
import RoleBadge from '@/components/RoleBadge'

export default function ProfilePage() {
  const { user, userData, loading } = useAuth()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    bio: '',
    gradYear: '',
    gradMonth: '',
    interestedPrograms: '',
    classOf: '',
    universityClassOf: '',
    university: '',
    program: '',
    jobTitle: '',
  })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    } else if (!loading && user && !userData) {
      router.push('/select-role')
    } else if (userData) {
      setFormData({
    fullName: userData.role === 'admin' ? 'Ms Matei' : (userData.fullName || ''),
    bio: userData.bio || '',
    gradYear: userData.gradYear?.toString() || '',
    gradMonth: userData.gradMonth?.toString() || '',
    interestedPrograms: userData.interestedPrograms?.join(', ') || '',
    classOf: userData.classOf?.toString() || '',
    universityClassOf: userData.universityClassOf?.toString() || '',
    university: userData.university || '',
    program: userData.program || '',
    jobTitle: userData.jobTitle || '',
  })
    }
  }, [user, userData, loading, router])

  const handleSave = async () => {
    if (!user || !userData) return

    setIsSaving(true)
    try {
      const updateData: any = {
        bio: formData.bio,
        updatedAt: new Date(),
      }

      // Admins always have the name "Ms Matei" - don't allow editing
      if (userData.role !== 'admin') {
        updateData.fullName = formData.fullName
      } else {
        // Ensure admin name is always "Ms Matei"
        updateData.fullName = 'Ms Matei'
      }

      if (userData.role === 'student') {
        updateData.gradYear = parseInt(formData.gradYear)
        updateData.gradMonth = parseInt(formData.gradMonth)
        updateData.interestedPrograms = formData.interestedPrograms
          .split(',')
          .map(p => p.trim())
          .filter(p => p.length > 0)
      } else if (userData.role === 'alumni') {
        updateData.classOf = parseInt(formData.classOf)
        updateData.universityClassOf = parseInt(formData.universityClassOf)
        updateData.university = formData.university
        updateData.program = formData.program || ''
        updateData.jobTitle = formData.jobTitle || ''
      }

      await updateDoc(doc(db, 'users', user.uid), updateData)
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setIsSaving(false)
    }
  }

  if (loading || !userData) {
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
    <div className="min-h-screen bg-white pt-14 md:pt-16">
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="bg-white border-2 border-gray-200 rounded-2xl shadow-sm p-8 md:p-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl md:text-4xl font-semibold">
                {(userData.role === 'admin' ? 'Ms Matei' : userData.fullName).charAt(0).toUpperCase()}
              </div>
              <div>
                {isEditing && userData.role !== 'admin' ? (
                  <Input
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="text-2xl md:text-3xl font-bold"
                  />
                ) : (
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                    {userData.role === 'admin' ? 'Ms Matei' : userData.fullName}
                  </h1>
                )}
                <RoleBadge role={userData.role} className="mt-3" />
              </div>
            </div>
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)} variant="outline" className="px-6 py-3 text-base">
                Edit Profile
              </Button>
            )}
          </div>

          <div className="space-y-6">
            {userData.role === 'student' && (
              <>
                {isEditing ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Graduation Year"
                        type="number"
                        value={formData.gradYear}
                        onChange={(e) => setFormData({ ...formData, gradYear: e.target.value })}
                      />
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Graduation Month
                        </label>
                        <select
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          value={formData.gradMonth}
                          onChange={(e) => setFormData({ ...formData, gradMonth: e.target.value })}
                        >
                          <option value="">Select month</option>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(month => (
                            <option key={month} value={month}>
                              {new Date(2000, month - 1).toLocaleString('default', { month: 'long' })}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <Input
                      label="Interested Programs (comma-separated)"
                      value={formData.interestedPrograms}
                      onChange={(e) => setFormData({ ...formData, interestedPrograms: e.target.value })}
                    />
                  </>
                ) : (
                  <>
                    {userData.gradYear && userData.gradMonth && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Graduation</h3>
                        <p className="text-gray-900">
                          {new Date(2000, userData.gradMonth - 1).toLocaleString('default', { month: 'long' })} {userData.gradYear}
                        </p>
                      </div>
                    )}
                    {userData.interestedPrograms && userData.interestedPrograms.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Interested Programs</h3>
                        <p className="text-gray-900">{userData.interestedPrograms.join(', ')}</p>
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {userData.role === 'alumni' && (
              <>
                {isEditing ? (
                  <>
                    <Input
                      label="Class of (High School Graduation Year)"
                      type="number"
                      value={formData.classOf}
                      onChange={(e) => setFormData({ ...formData, classOf: e.target.value })}
                      min="2000"
                      max="2030"
                    />
                    <Input
                      label="Class of (University Graduation Year)"
                      type="number"
                      value={formData.universityClassOf}
                      onChange={(e) => setFormData({ ...formData, universityClassOf: e.target.value })}
                      required
                      min="2000"
                      max="2035"
                    />
                    <Input
                      label="University/College or Workplace"
                      value={formData.university}
                      onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                    />
                    <Input
                      label="Program/Major"
                      value={formData.program}
                      onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                      placeholder="Computer Science"
                    />
                    <Input
                      label="Current Career/Job Title"
                      value={formData.jobTitle}
                      onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                      placeholder="Software Engineer"
                    />
                  </>
                ) : (
                  <>
                    {userData.classOf && (
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <h3 className="text-base font-semibold text-gray-700 mb-1">Class of (High School)</h3>
                        <p className="text-lg md:text-xl font-bold text-gray-900">{userData.classOf}</p>
                      </div>
                    )}
                    {userData.universityClassOf && (
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <h3 className="text-base font-semibold text-gray-700 mb-1">Class of (University)</h3>
                        <p className="text-lg md:text-xl font-bold text-gray-900">{userData.universityClassOf}</p>
                      </div>
                    )}
                    {userData.university && (
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <h3 className="text-base font-semibold text-gray-700 mb-1">University/Workplace</h3>
                        <p className="text-lg md:text-xl font-bold text-gray-900">{userData.university}</p>
                      </div>
                    )}
                    {userData.program && (
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <h3 className="text-base font-semibold text-gray-700 mb-1">Program/Major</h3>
                        <p className="text-lg md:text-xl font-bold text-gray-900">{userData.program}</p>
                      </div>
                    )}
                    {userData.jobTitle && (
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <h3 className="text-base font-semibold text-gray-700 mb-1">Current Career/Job Title</h3>
                        <p className="text-lg md:text-xl font-bold text-gray-900">{userData.jobTitle}</p>
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {isEditing ? (
              <Textarea
                label="Bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={6}
                className="text-base"
              />
            ) : (
              userData.bio && (
                <div className="p-4 bg-gray-50 rounded-xl">
                  <h3 className="text-base font-semibold text-gray-700 mb-3">Bio</h3>
                  <p className="text-base md:text-lg text-gray-900 whitespace-pre-wrap leading-relaxed">{userData.bio}</p>
                </div>
              )
            )}

            {isEditing && (
              <div className="flex gap-3">
                <Button onClick={handleSave} isLoading={isSaving}>
                  Save Changes
                </Button>
                <Button onClick={() => setIsEditing(false)} variant="outline">
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      <Navigation />
    </div>
  )
}

