import { UserRole } from '@/lib/types'

interface RoleBadgeProps {
  role: UserRole
  className?: string
}

export default function RoleBadge({ role, className = '' }: RoleBadgeProps) {
  const styles = {
    student: 'bg-blue-100 text-blue-800',
    alumni: 'bg-green-100 text-green-800',
    admin: 'bg-purple-100 text-purple-800',
  }

  const labels = {
    student: 'Student',
    alumni: 'Alumni',
    admin: 'Admin',
  }

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${styles[role]} ${className}`}>
      {labels[role]}
    </span>
  )
}

