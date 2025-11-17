'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { doc, getDoc, collection, query, where, orderBy, onSnapshot, addDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { Conversation, Message, User } from '@/lib/types'
import Navigation from '@/components/Navigation'
import Button from '@/components/Button'
import RoleBadge from '@/components/RoleBadge'
import BackButton from '@/components/BackButton'
import { formatTimestamp } from '@/lib/utils'

export default function ConversationPage() {
  const { user, userData, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const conversationId = params.conversationId as string
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [otherUser, setOtherUser] = useState<User | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    } else if (!loading && user && !userData) {
      router.push('/select-role')
    }
  }, [user, userData, loading, router])

  useEffect(() => {
    if (!conversationId || !user) return

    const loadConversation = async () => {
      const convDoc = await getDoc(doc(db, 'conversations', conversationId))
      if (!convDoc.exists()) {
        router.push('/messages')
        return
      }

      const convData = { id: convDoc.id, ...convDoc.data() } as Conversation
      setConversation(convData)

      const otherUserId = convData.participantIds.find(id => id !== user.uid)
      if (otherUserId) {
        const userDoc = await getDoc(doc(db, 'users', otherUserId))
        if (userDoc.exists()) {
          setOtherUser({ uid: userDoc.id, ...userDoc.data() } as User)
        }
      }
    }

    loadConversation()
  }, [conversationId, user, router])

  useEffect(() => {
    if (!conversationId) return

    const q = query(
      collection(db, 'messages'),
      where('conversationId', '==', conversationId),
      orderBy('createdAt', 'asc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[]
      setMessages(messagesData)
    })

    return () => unsubscribe()
  }, [conversationId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !user || !conversationId) return

    setIsSending(true)
    try {
      await addDoc(collection(db, 'messages'), {
        conversationId,
        senderId: user.uid,
        content: newMessage.trim(),
        createdAt: new Date(),
      })

      // Update conversation last message
      await updateDoc(doc(db, 'conversations', conversationId), {
        lastMessage: newMessage.trim(),
        lastMessageAt: new Date(),
        updatedAt: new Date(),
      })

      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsSending(false)
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
    <div className="min-h-screen bg-gray-50 pt-14 md:pt-16 flex flex-col">
      {/* Header */}
      {otherUser && (
        <div className="bg-white border-b border-gray-200 shadow-sm sticky top-14 md:top-16 z-10">
          <div className="max-w-4xl mx-auto px-4 md:px-6 py-4">
            <div className="flex items-center gap-4">
              <BackButton href="/messages" />
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-semibold flex-shrink-0">
                {(otherUser.role === 'admin' ? 'Ms Matei' : otherUser.fullName).charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-lg text-gray-900 truncate">
                  {otherUser.role === 'admin' ? 'Ms Matei' : otherUser.fullName}
                </h2>
                {otherUser.username && (
                  <p className="text-sm text-gray-500">@{otherUser.username}</p>
                )}
              </div>
              <RoleBadge role={otherUser.role} />
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-lg font-medium text-gray-600">No messages yet</p>
              <p className="text-sm text-gray-400 mt-1">Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => {
              const isOwn = message.senderId === user?.uid
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group`}
                >
                  <div
                    className={`max-w-[75%] md:max-w-md ${
                      isOwn ? 'flex flex-col items-end' : 'flex flex-col items-start'
                    }`}
                  >
                    <div
                      className={`px-4 py-3 rounded-2xl ${
                        isOwn
                          ? 'bg-primary text-white rounded-br-md'
                          : 'bg-white text-gray-900 border border-gray-200 rounded-bl-md shadow-sm'
                      }`}
                    >
                      <p className="whitespace-pre-wrap text-[15px] leading-relaxed break-words">
                        {message.content}
                      </p>
                    </div>
                    <p
                      className={`text-xs mt-1.5 px-1 ${
                        isOwn ? 'text-gray-500' : 'text-gray-400'
                      }`}
                    >
                      {formatTimestamp(message.createdAt)}
                    </p>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-4 md:px-6 py-4">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                rows={1}
                className="w-full px-4 py-3 pr-12 text-[15px] border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none max-h-32 overflow-y-auto"
                onKeyDown={async (e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    if (newMessage.trim() && !isSending) {
                      const syntheticEvent = {
                        preventDefault: () => {},
                      } as React.FormEvent
                      await handleSendMessage(syntheticEvent)
                    }
                  }
                }}
              />
            </div>
            <button
              type="submit"
              disabled={!newMessage.trim() || isSending}
              className={`px-6 py-3 rounded-2xl font-medium text-sm transition-all flex-shrink-0 ${
                newMessage.trim() && !isSending
                  ? 'bg-primary text-white hover:bg-primary-dark shadow-md hover:shadow-lg'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isSending ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Send'
              )}
            </button>
          </div>
        </form>
      </div>

      <Navigation />
    </div>
  )
}

