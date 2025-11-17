import { NextRequest, NextResponse } from 'next/server'
import { adminDb, adminAuth } from '@/firebase/admin'

export async function PUT(request: NextRequest) {
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
    const uid = searchParams.get('uid') || decodedToken.uid
    
    // Users can only update their own profile unless they're admin
    if (uid !== decodedToken.uid) {
      const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get()
      const userData = userDoc.data()
      if (userData?.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      }
    }

    const updateData = await request.json()
    
    // Remove fields that shouldn't be updated via API
    delete updateData.uid
    delete updateData.email
    delete updateData.role
    delete updateData.createdAt

    updateData.updatedAt = new Date()

    await adminDb.collection('users').doc(uid).update(updateData)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: error.message || 'Failed to update user' }, { status: 500 })
  }
}

