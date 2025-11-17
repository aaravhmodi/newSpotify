'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { collection, query, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { User } from '@/lib/types'
import Navigation from '@/components/Navigation'
import RoleBadge from '@/components/RoleBadge'
import Link from 'next/link'

const ExploreIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
)

export default function ExplorePage() {
  const { user, userData, loading } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'alumni'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    } else if (!loading && user && !userData) {
      router.push('/select-role')
    }
  }, [user, userData, loading, router])

  useEffect(() => {
    if (!userData) return

    const q = query(collection(db, 'users'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData = snapshot.docs
        .map(doc => ({
          uid: doc.id,
          ...doc.data(),
        })) as User[]
      const filteredUsers = usersData.filter(u => u.uid !== user?.uid) // Exclude current user
      setUsers(filteredUsers)
    })

    return () => unsubscribe()
  }, [userData, user])

  const filteredUsers = users.filter(user => {
    // Ensure role exists and is valid
    if (!user.role || (user.role !== 'student' && user.role !== 'alumni' && user.role !== 'admin')) {
      return false
    }
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    const matchesSearch = searchQuery === '' || 
      user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.university && user.university.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.program && user.program.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.jobTitle && user.jobTitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.interestedPrograms && user.interestedPrograms.some(p => 
        p.toLowerCase().includes(searchQuery.toLowerCase())
      ))
    return matchesRole && matchesSearch
  })

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
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <ExploreIcon className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Explore</h1>
        </div>

        {/* Search and Filters */}
        <div className="bg-white border-2 border-gray-200 rounded-2xl shadow-sm p-6 md:p-8 mb-8 space-y-6">
          <div className="relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
              <ExploreIcon className="w-6 h-6 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name, program, or university..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 text-base md:text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => setRoleFilter('all')}
              className={`px-6 py-3 rounded-xl text-base font-medium transition-all ${
                roleFilter === 'all' ? 'bg-primary text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setRoleFilter('student')}
              className={`px-6 py-3 rounded-xl text-base font-medium transition-all ${
                roleFilter === 'student' ? 'bg-primary text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
              }`}
            >
              Students
            </button>
            <button
              onClick={() => setRoleFilter('alumni')}
              className={`px-6 py-3 rounded-xl text-base font-medium transition-all ${
                roleFilter === 'alumni' ? 'bg-primary text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
              }`}
            >
              Alumni
            </button>
          </div>
        </div>

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredUsers.length === 0 ? (
            <div className="col-span-2 bg-white border-2 border-gray-200 rounded-2xl shadow-sm p-12 text-center">
              <p className="text-lg md:text-xl text-gray-500">No users found.</p>
              {users.length === 0 && (
                <p className="text-sm text-gray-400 mt-2">No other users in the database yet.</p>
              )}
            </div>
          ) : (
            filteredUsers.map((userItem) => {
              const displayName = userItem.role === 'admin' ? 'Ms Matei' : userItem.fullName
              return (
                <Link
                  key={userItem.uid}
                  href={`/profile/${userItem.uid}`}
                  className="bg-white border-2 border-gray-200 rounded-2xl shadow-sm p-6 md:p-8 hover:shadow-lg hover:border-primary/30 transition-all active:scale-[0.98]"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl md:text-3xl font-semibold flex-shrink-0">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">{displayName}</h3>
                      <RoleBadge role={userItem.role} />
                    </div>
                  </div>
                
                  {userItem.role === 'student' && (
                    <div className="space-y-2 text-base text-gray-700">
                      {userItem.gradYear && (
                        <p className="font-medium">Graduating: {userItem.gradMonth && new Date(2000, userItem.gradMonth - 1).toLocaleString('default', { month: 'long' })} {userItem.gradYear}</p>
                      )}
                      {userItem.interestedPrograms && userItem.interestedPrograms.length > 0 && (
                        <p><span className="font-medium">Interested in:</span> {userItem.interestedPrograms.join(', ')}</p>
                      )}
                    </div>
                  )}
                  
                  {userItem.role === 'alumni' && (
                    <div className="space-y-2 text-base text-gray-700">
                      {userItem.classOf && <p className="font-medium">Class of {userItem.classOf} (High School)</p>}
                      {userItem.universityClassOf && <p className="font-medium">Class of {userItem.universityClassOf} (University)</p>}
                      {userItem.university && <p><span className="font-medium">University:</span> {userItem.university}</p>}
                      {userItem.program && <p><span className="font-medium">Program:</span> {userItem.program}</p>}
                      {userItem.jobTitle && <p><span className="font-medium">Job:</span> {userItem.jobTitle}</p>}
                    </div>
                  )}
                  
                  {userItem.bio && (
                    <p className="mt-4 text-base text-gray-600 line-clamp-2 leading-relaxed">{userItem.bio}</p>
                  )}
                </Link>
              )
            })
          )}
        </div>
      </div>
      <Navigation />
    </div>
  )
}

