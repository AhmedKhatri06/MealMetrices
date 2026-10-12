const ROLES = ['STUDENT', 'STAFF', 'ADMIN']

export function normalizeRole(value) {
  if (typeof value !== 'string') return null
  const role = value.toUpperCase().replace(/^ROLE_/, '')
  return ROLES.includes(role) ? role : null
}

export function getRoleHome(role) {
  switch (normalizeRole(role)) {
    case 'STUDENT': return '/student/dashboard'
    case 'STAFF': return '/staff/operations'
    case 'ADMIN': return '/admin/dashboard'
    default: return '/login'
  }
}
