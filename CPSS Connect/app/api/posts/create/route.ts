import { NextRequest, NextResponse } from 'next/server'
import { adminDb, adminAuth } from '@/firebase/admin'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!adminAuth) {
      return NextResponse.json({ error: 'Admin not initialized' }, { status: 500 })
    }
    
    const token = authHeader.split('Bearer ')[1]
    const decodedToken = await adminAuth.verifyIdToken(token)
    
    const { content } = await request.json()
    
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    if (!adminDb) {
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 })
    }

    // Get user data
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get()
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userData = userDoc.data()

    // Create post
    const postRef = await adminDb.collection('posts').add({
      authorId: decodedToken.uid,
      authorRole: userData?.role || 'student',
      content: content.trim(),
      createdAt: new Date(),
    })

    return NextResponse.json({ id: postRef.id, success: true })
  } catch (error: any) {
    console.error('Error creating post:', error)
    return NextResponse.json({ error: error.message || 'Failed to create post' }, { status: 500 })
  }
}

