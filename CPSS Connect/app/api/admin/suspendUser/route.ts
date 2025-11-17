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
    
    // Verify user is admin
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get()
    const userData = userDoc.data()
    
    if (userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { uid, suspended } = await request.json()
    
    if (!uid) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    await adminDb.collection('users').doc(uid).update({
      suspended: suspended === true,
      updatedAt: new Date(),
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error suspending user:', error)
    return NextResponse.json({ error: error.message || 'Failed to suspend user' }, { status: 500 })
  }
}

