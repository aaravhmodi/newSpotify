# CPSS Connect

A private social networking app for high school students and alumni, built with Next.js, Firebase, and deployed on Vercel.

## Features

- **Authentication**: Email/password login with Firebase Auth
- **Role-based System**: Students, Alumni, and Admin roles
- **Auto-Graduation**: Students automatically convert to Alumni after graduation
- **Home Feed**: View and create posts from all users
- **Explore**: Browse and filter users by role
- **Messaging**: One-to-one direct messaging
- **Profiles**: View and edit user profiles
- **Admin Dashboard**: User and post management for admins

## Tech Stack

- Next.js 14+ (App Router)
- React Server + Client Components
- TailwindCSS
- Firebase Auth
- Firestore
- Vercel (deployment)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file with your Firebase credentials:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Optional: Firebase Admin SDK (for server-side operations)
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project_id.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
```

3. Set up Firebase:
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication:
     - Go to Authentication > Sign-in method
     - Enable **Email/Password** provider
     - Enable **Google** provider (click Google, toggle Enable, and save)
   - Create a Firestore database
   - Deploy the security rules from `firestore.rules`
   - Create an admin user:
     - Sign up a user through the app (or sign in with existing account)
     - Go to `/admin/login` and enter the access code: `Matei2025`
     - The system will automatically grant admin privileges

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

Deploy to Vercel:
1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

## Firebase Security Rules

See `firestore.rules` for the security rules configuration. Deploy them using:
```bash
firebase deploy --only firestore:rules
```

## Admin Setup

To set up an admin account:

1. Create a user account through the normal signup flow (or sign in with existing account)
2. Go to `/admin/login`
3. Enter the admin access code: `Matei2025`
4. The system will automatically grant admin privileges to your account

**Note:** The admin access code is hardcoded as `Matei2025` and cannot be changed without modifying the code.

## Project Structure

```
app/
├── login/              # Login page
├── signup/             # Signup page
├── select-role/        # Role selection after first login
├── onboarding/         # Student/Alumni onboarding forms
├── home/               # Main feed with posts
├── explore/            # User directory
├── messages/           # Messaging interface
├── profile/            # User profiles
└── admin/              # Admin dashboard
components/             # Reusable UI components
firebase/               # Firebase configuration
hooks/                  # Custom React hooks
lib/                    # Utilities and types
```

## Features

### User Roles

- **Student**: Current high school students with graduation date
- **Alumni**: Graduated students with university/job info
- **Admin**: Ms. Matei - can manage users and posts

### Auto-Graduation

Students automatically convert to Alumni when the current date reaches their graduation month/year.

### Key Features

- Real-time post feed
- User directory with search and filters
- One-to-one messaging
- Profile management
- Admin moderation tools

