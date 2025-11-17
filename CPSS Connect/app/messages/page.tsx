'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { collection, query, where, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { Conversation, User } from '@/lib/types'
import Navigation from '@/components/Navigation'
import { formatTimestamp } from '@/lib/utils'
import Link from 'next/link'

const MessagesIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
)

export default function MessagesPage() {
  const { user, userData, loading } = useAuth()
  const router = useRouter()
  const [conversations, setConversations] = useState<(Conversation & { otherUser?: User })[]>([])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    } else if (!loading && user && !userData) {
      router.push('/select-role')
    }
  }, [user, userData, loading, router])

  useEffect(() => {
    if (!user) return

    // Query conversations - handle cases where lastMessageAt might not exist
    const q = query(
      collection(db, 'conversations'),
      where('participantIds', 'array-contains', user.uid)
    )
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const conversationsData = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const data = { id: doc.id, ...doc.data() } as Conversation
          const otherUserId = data.participantIds.find(id => id !== user.uid)
          let otherUser: User | undefined

          if (otherUserId) {
            const userDoc = await getDoc(doc(db, 'users', otherUserId))
            if (userDoc.exists()) {
              otherUser = { uid: userDoc.id, ...userDoc.data() } as User
            }
          }

          return { ...data, otherUser }
        })
      )
      // Sort by lastMessageAt if it exists, otherwise by createdAt
      conversationsData.sort((a, b) => {
        const aTime = a.lastMessageAt?.toDate?.() || a.createdAt?.toDate?.() || new Date(0)
        const bTime = b.lastMessageAt?.toDate?.() || b.createdAt?.toDate?.() || new Date(0)
        return bTime.getTime() - aTime.getTime()
      })
      setConversations(conversationsData)
    })

    return () => unsubscribe()
  }, [user])

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
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <MessagesIcon className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Messages</h1>
          </div>
          <Link
            href="/explore"
            className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors font-medium text-base shadow-md hover:shadow-lg"
          >
            New Message
          </Link>
        </div>

        <div className="bg-white border-2 border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          {conversations.length === 0 ? (
            <div className="p-12 md:p-16 text-center">
              <MessagesIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-lg md:text-xl text-gray-500 mb-4">No conversations yet.</p>
              <Link href="/explore" className="text-primary hover:underline font-medium text-base">
                Start a conversation
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {conversations.map((conversation) => {
                const otherUserName = conversation.otherUser?.role === 'admin' 
                  ? 'Ms Matei' 
                  : (conversation.otherUser?.fullName || 'Unknown User')
                return (
                  <Link
                    key={conversation.id}
                    href={`/messages/${conversation.id}`}
                    className="block p-6 md:p-8 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-4 md:gap-6">
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl md:text-3xl font-semibold flex-shrink-0">
                        {otherUserName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg md:text-xl text-gray-900 truncate mb-1">
                          {otherUserName}
                        </h3>
                        <p className="text-base md:text-lg text-gray-600 truncate">
                          {conversation.lastMessage || 'No messages yet'}
                        </p>
                      </div>
                      {conversation.lastMessageAt && (
                        <div className="text-sm text-gray-400 flex-shrink-0">
                          {formatTimestamp(conversation.lastMessageAt)}
                        </div>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
      <Navigation />
    </div>
  )
}

