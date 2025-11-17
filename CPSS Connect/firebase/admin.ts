import { initializeApp, getApps, cert, App } from 'firebase-admin/app'
import { getFirestore, Firestore } from 'firebase-admin/firestore'
import { getAuth, Auth } from 'firebase-admin/auth'

let adminApp: App | undefined
let adminDb: Firestore | undefined
let adminAuth: Auth | undefined

if (!getApps().length) {
  try {
    if (process.env.FIREBASE_ADMIN_PROJECT_ID && 
        process.env.FIREBASE_ADMIN_CLIENT_EMAIL && 
        process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
      adminApp = initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      })
      adminDb = getFirestore(adminApp)
      adminAuth = getAuth(adminApp)
    }
  } catch (error) {
    console.error('Firebase Admin initialization error:', error)
  }
} else {
  adminApp = getApps()[0]
  adminDb = getFirestore(adminApp)
  adminAuth = getAuth(adminApp)
}

export { adminDb, adminAuth }
export default adminApp

