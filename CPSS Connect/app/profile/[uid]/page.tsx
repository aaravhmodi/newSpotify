'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { User, Conversation } from '@/lib/types'
import Navigation from '@/components/Navigation'
import Button from '@/components/Button'
import RoleBadge from '@/components/RoleBadge'
import BackButton from '@/components/BackButton'
import Link from 'next/link'

export default function UserProfilePage() {
  const { user, userData, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const uid = params.uid as string
  const [profileUser, setProfileUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (!authLoading && user && !userData) {
      router.push('/select-role')
    }
  }, [user, userData, authLoading, router])

  useEffect(() => {
    if (!uid) return

    const loadProfile = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', uid))
        if (userDoc.exists()) {
          setProfileUser({ uid: userDoc.id, ...userDoc.data() } as User)
        } else {
          router.push('/explore')
        }
      } catch (error) {
        console.error('Error loading profile:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [uid, router])

  const handleStartConversation = async () => {
    if (!user || !profileUser) return

    // Check if conversation already exists
    const conversationsQuery = query(
      collection(db, 'conversations'),
      where('participantIds', 'array-contains', user.uid)
    )
    const conversationsSnapshot = await getDocs(conversationsQuery)
    
    let existingConversation: Conversation | null = null
    conversationsSnapshot.forEach((doc) => {
      const data = { id: doc.id, ...doc.data() } as Conversation
      if (data.participantIds.includes(profileUser.uid)) {
        existingConversation = data
      }
    })

    if (existingConversation) {
      router.push(`/messages/${existingConversation.id}`)
    } else {
      // Create new conversation
      const { addDoc } = await import('firebase/firestore')
      const newConversation = await addDoc(collection(db, 'conversations'), {
        participantIds: [user.uid, profileUser.uid],
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      router.push(`/messages/${newConversation.id}`)
    }
  }

  if (loading || authLoading || !userData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-white pt-14 md:pt-16 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">User not found</p>
          <Link href="/explore" className="text-primary hover:underline mt-4 inline-block">
            Go back to Explore
          </Link>
        </div>
      </div>
    )
  }

  const isOwnProfile = user?.uid === profileUser.uid

  return (
    <div className="min-h-screen bg-white pt-14 md:pt-16">
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="mb-4">
          <BackButton href="/explore" />
        </div>
        <div className="bg-white border-2 border-gray-200 rounded-2xl shadow-sm p-8 md:p-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl md:text-4xl font-semibold">
                {(profileUser.role === 'admin' ? 'Ms Matei' : profileUser.fullName).charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {profileUser.role === 'admin' ? 'Ms Matei' : profileUser.fullName}
                </h1>
                <RoleBadge role={profileUser.role} className="mt-3" />
              </div>
            </div>
            {!isOwnProfile && (
              <Button onClick={handleStartConversation} className="px-6 py-3 text-base">
                Message
              </Button>
            )}
            {isOwnProfile && (
              <Link href="/profile">
                <Button variant="outline" className="px-6 py-3 text-base">Edit Profile</Button>
              </Link>
            )}
          </div>

          <div className="space-y-6">
            {profileUser.role === 'student' && (
              <>
                {profileUser.gradYear && profileUser.gradMonth && (
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <h3 className="text-base font-semibold text-gray-700 mb-1">Graduation</h3>
                    <p className="text-lg md:text-xl font-bold text-gray-900">
                      {new Date(2000, profileUser.gradMonth - 1).toLocaleString('default', { month: 'long' })} {profileUser.gradYear}
                    </p>
                  </div>
                )}
                {profileUser.interestedPrograms && profileUser.interestedPrograms.length > 0 && (
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <h3 className="text-base font-semibold text-gray-700 mb-1">Interested Programs</h3>
                    <p className="text-lg md:text-xl font-bold text-gray-900">{profileUser.interestedPrograms.join(', ')}</p>
                  </div>
                )}
              </>
            )}

            {profileUser.role === 'alumni' && (
              <>
                {profileUser.classOf && (
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <h3 className="text-base font-semibold text-gray-700 mb-1">Class of (High School)</h3>
                    <p className="text-lg md:text-xl font-bold text-gray-900">{profileUser.classOf}</p>
                  </div>
                )}
                {profileUser.universityClassOf && (
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <h3 className="text-base font-semibold text-gray-700 mb-1">Class of (University)</h3>
                    <p className="text-lg md:text-xl font-bold text-gray-900">{profileUser.universityClassOf}</p>
                  </div>
                )}
                {profileUser.university && (
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <h3 className="text-base font-semibold text-gray-700 mb-1">University/Workplace</h3>
                    <p className="text-lg md:text-xl font-bold text-gray-900">{profileUser.university}</p>
                  </div>
                )}
                {profileUser.program && (
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <h3 className="text-base font-semibold text-gray-700 mb-1">Program/Major</h3>
                    <p className="text-lg md:text-xl font-bold text-gray-900">{profileUser.program}</p>
                  </div>
                )}
                {profileUser.jobTitle && (
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <h3 className="text-base font-semibold text-gray-700 mb-1">Current Career/Job Title</h3>
                    <p className="text-lg md:text-xl font-bold text-gray-900">{profileUser.jobTitle}</p>
                  </div>
                )}
              </>
            )}

            {profileUser.bio && (
              <div className="p-4 bg-gray-50 rounded-xl">
                <h3 className="text-base font-semibold text-gray-700 mb-3">Bio</h3>
                <p className="text-base md:text-lg text-gray-900 whitespace-pre-wrap leading-relaxed">{profileUser.bio}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Navigation />
    </div>
  )
}

