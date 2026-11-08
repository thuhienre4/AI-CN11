// Who may use teacher tools in the interface. The server enforces the same rule on every request;
// this only keeps buttons it would refuse out of sight.
export const STAFF_ROLES = ['teacher', 'admin', 'moderator']

export const isStaffRole = (user) => STAFF_ROLES.includes(user?.role)

// Accounts created before verification existed, and offline demo accounts, carry no status: treated as verified.
export const isVerified = (user) => (user?.account_status ?? 'verified') === 'verified'

export const canActAsTeacher = (user) => isStaffRole(user) && isVerified(user)

export const isVerifiedTeacher = (user) => user?.role === 'teacher' && isVerified(user)

// Same rule as DELETE /api/materials/{id}: the uploader or an administrator. Materials kept only on this device
// (local-material-…) belong to whoever created them here.
export const canDeleteMaterial = (user, material) => {
  if (!user || !material) return false
  if (String(material.id).startsWith('local-material-')) return true
  if (['admin', 'moderator'].includes(user.role) && isVerified(user)) return true
  return isVerifiedTeacher(user) && material.uploader_user_id === user.id
}
