'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { User, Post } from '@/lib/types'
import Navigation from '@/components/Navigation'
import Button from '@/components/Button'
import RoleBadge from '@/components/RoleBadge'
import { formatTimestamp } from '@/lib/utils'

const AdminIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

export default function AdminDashboard() {
  const { user, userData, loading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'users' | 'posts'>('users')
  const [users, setUsers] = useState<User[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [postAuthorMap, setPostAuthorMap] = useState<Record<string, User>>({})

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    } else if (!loading && userData && userData.role !== 'admin') {
      router.push('/home')
    }
  }, [user, userData, loading, router])

  useEffect(() => {
    if (!userData || userData.role !== 'admin') return

    const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'))
    const usersUnsubscribe = onSnapshot(usersQuery, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data(),
      })) as User[]
      setUsers(usersData)
    })

    const postsQuery = query(collection(db, 'posts'), orderBy('createdAt', 'desc'))
    const postsUnsubscribe = onSnapshot(postsQuery, async (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Post[]
      setPosts(postsData)

      // Fetch author data for all posts
      const authorIds = [...new Set(postsData.map(post => post.authorId))]
      const authorData: Record<string, User> = {}
      
      await Promise.all(
        authorIds.map(async (authorId) => {
          try {
            const userDoc = await getDoc(doc(db, 'users', authorId))
            if (userDoc.exists()) {
              authorData[authorId] = { uid: userDoc.id, ...userDoc.data() } as User
            }
          } catch (error) {
            console.error(`Error fetching user ${authorId}:`, error)
          }
        })
      )
      
      setPostAuthorMap(authorData)
    })

    return () => {
      usersUnsubscribe()
      postsUnsubscribe()
    }
  }, [userData])

  const handleSuspendUser = async (uid: string, currentStatus: boolean) => {
    if (!confirm(`Are you sure you want to ${currentStatus ? 'unsuspend' : 'suspend'} this user?`)) return

    try {
      await updateDoc(doc(db, 'users', uid), {
        suspended: !currentStatus,
        updatedAt: new Date(),
      })
    } catch (error) {
      console.error('Error updating user:', error)
      alert('Failed to update user status')
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return

    try {
      await deleteDoc(doc(db, 'posts', postId))
    } catch (error) {
      console.error('Error deleting post:', error)
      alert('Failed to delete post')
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

  if (userData.role !== 'admin') {
    return null
  }

  return (
    <div className="min-h-screen bg-white pt-14 md:pt-16">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <AdminIcon className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Admin Dashboard</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-8 border-b-2 border-gray-200">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-4 text-base md:text-lg font-semibold transition-colors border-b-2 ${
              activeTab === 'users'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('posts')}
            className={`px-6 py-4 text-base md:text-lg font-semibold transition-colors border-b-2 ${
              activeTab === 'posts'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Posts ({posts.length})
          </button>
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white border-2 border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((userItem) => {
                    const displayName = userItem.role === 'admin' ? 'Ms Matei' : userItem.fullName
                    return (
                      <tr key={userItem.uid} className="hover:bg-gray-50">
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="text-base font-semibold text-gray-900">{displayName}</div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="text-base text-gray-600">{userItem.email}</div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <RoleBadge role={userItem.role} />
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <span className={`text-base font-medium ${userItem.suspended ? 'text-red-600' : 'text-green-600'}`}>
                            {userItem.suspended ? 'Suspended' : 'Active'}
                          </span>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <Button
                            variant={userItem.suspended ? 'primary' : 'outline'}
                            onClick={() => handleSuspendUser(userItem.uid, userItem.suspended || false)}
                            className="text-sm px-4 py-2"
                          >
                            {userItem.suspended ? 'Unsuspend' : 'Suspend'}
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Posts Tab */}
        {activeTab === 'posts' && (
          <div className="space-y-6">
            {posts.length === 0 ? (
              <div className="bg-white border-2 border-gray-200 rounded-2xl shadow-sm p-12 text-center">
                <p className="text-lg md:text-xl text-gray-500">No posts found.</p>
              </div>
            ) : (
              posts.map((post) => {
                const author = postAuthorMap[post.authorId]
                const authorName = author?.role === 'admin' 
                  ? 'Ms Matei' 
                  : (author?.fullName || 'Unknown User')
                return (
                  <div key={post.id} className="bg-white border-2 border-gray-200 rounded-2xl shadow-sm p-6 md:p-8">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-semibold">
                          {authorName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-lg text-gray-900">
                              {authorName}
                            </span>
                            <RoleBadge role={post.authorRole} />
                          </div>
                          <p className="text-base text-gray-500">{formatTimestamp(post.createdAt)}</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => handleDeletePost(post.id)}
                        className="text-red-600 border-red-300 hover:bg-red-50 px-4 py-2"
                      >
                        Delete
                      </Button>
                    </div>
                    <p className="text-base md:text-lg text-gray-800 whitespace-pre-wrap leading-relaxed">{post.content}</p>
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>
      <Navigation />
    </div>
  )
}

