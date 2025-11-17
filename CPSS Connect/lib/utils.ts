import { formatDistanceToNow } from 'date-fns'

export function formatTimestamp(timestamp: any): string {
  if (!timestamp) return ''
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return formatDistanceToNow(date, { addSuffix: true })
}

export function checkAutoGraduation(user: any): boolean {
  if (user.role !== 'student' || !user.gradYear || !user.gradMonth) {
    return false
  }

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1 // getMonth() returns 0-11

  if (currentYear > user.gradYear) {
    return true
  }

  if (currentYear === user.gradYear && currentMonth >= user.gradMonth) {
    return true
  }

  return false
}

