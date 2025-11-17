'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

// Icon components
const HomeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
)

const ExploreIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
)

const MessagesIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
)

const ProfileIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

const AdminIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const SignOutIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
)

export default function Navigation() {
  const pathname = usePathname()
  const { userData, signOut } = useAuth()
  const router = useRouter()

  if (!userData) return null

  const isActive = (path: string) => pathname === path

  const navItems = [
    { path: '/home', label: 'Home', icon: HomeIcon },
    { path: '/explore', label: 'Explore', icon: ExploreIcon },
    { path: '/messages', label: 'Messages', icon: MessagesIcon },
    { path: '/profile', label: 'Profile', icon: ProfileIcon },
  ]

  if (userData.role === 'admin') {
    navItems.push({ path: '/admin', label: 'Admin', icon: AdminIcon })
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  return (
    <nav className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo/Brand */}
          <Link href="/home" className="flex items-center flex-shrink-0">
            <span className="text-lg sm:text-xl md:text-2xl font-bold text-primary">CPSS Connect</span>
          </Link>

          {/* Navigation Items */}
          <div className="flex items-center gap-0.5 sm:gap-1 md:gap-2 overflow-x-auto scrollbar-hide">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg transition-colors flex-shrink-0 ${
                  isActive(item.path)
                    ? 'text-primary bg-primary/10 font-semibold'
                    : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                }`}
                title={item.label}
              >
                <item.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline text-xs sm:text-sm md:text-base font-medium">{item.label}</span>
              </Link>
            ))}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors flex-shrink-0"
              title="Sign Out"
            >
              <SignOutIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline text-xs sm:text-sm md:text-base font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

