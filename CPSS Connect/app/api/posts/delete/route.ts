import { NextRequest, NextResponse } from 'next/server'
import { adminDb, adminAuth } from '@/firebase/admin'

export async function DELETE(request: NextRequest) {
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
    
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get('id')
    
    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 })
    }

    // Get post
    const postDoc = await adminDb.collection('posts').doc(postId).get()
    if (!postDoc.exists) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    const postData = postDoc.data()

    // Get user data to check role
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get()
    const userData = userDoc.data()

    // Check if user is author or admin
    if (postData?.authorId !== decodedToken.uid && userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Delete post
    await adminDb.collection('posts').doc(postId).delete()

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting post:', error)
    return NextResponse.json({ error: error.message || 'Failed to delete post' }, { status: 500 })
  }
}

