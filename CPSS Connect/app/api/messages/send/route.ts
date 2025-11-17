import { NextRequest, NextResponse } from 'next/server'
import { adminDb, adminAuth } from '@/firebase/admin'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!adminAuth || !adminDb) {
      return NextResponse.json({ error: 'Admin not initialized' }, { status: 500 })
    }
    
    const token = authHeader.split('Bearer ')[1]
    const decodedToken = await adminAuth.verifyIdToken(token)
    
    const { conversationId, content } = await request.json()
    
    if (!conversationId || !content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ error: 'Conversation ID and content are required' }, { status: 400 })
    }

    // Verify user is participant
    const conversationDoc = await adminDb.collection('conversations').doc(conversationId).get()
    if (!conversationDoc.exists) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    const conversationData = conversationDoc.data()
    if (!conversationData?.participantIds.includes(decodedToken.uid)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Create message
    const messageRef = await adminDb.collection('messages').add({
      conversationId,
      senderId: decodedToken.uid,
      content: content.trim(),
      createdAt: new Date(),
    })

    // Update conversation
    await adminDb.collection('conversations').doc(conversationId).update({
      lastMessage: content.trim(),
      lastMessageAt: new Date(),
      updatedAt: new Date(),
    })

    return NextResponse.json({ id: messageRef.id, success: true })
  } catch (error: any) {
    console.error('Error sending message:', error)
    return NextResponse.json({ error: error.message || 'Failed to send message' }, { status: 500 })
  }
}

