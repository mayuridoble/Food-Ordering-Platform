import { Navigate, useLocation } from 'react-router-dom'
import { useAppSelector } from '../../hooks/useAppSelector'
import LoadingSpinner from '../ui/LoadingSpinner'

function RequireRole({ allowedRoles = [], children }) {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
  const user = useAppSelector((state) => state.auth.user)
  const location = useLocation()

  const token = localStorage.getItem('auth_token')

  if (token && (!isAuthenticated || !user)) {
    return <LoadingSpinner />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  const role = String(user?.role || '').toUpperCase()
  const isAllowed = allowedRoles.map((r) => String(r).toUpperCase()).includes(role)

  if (!isAllowed) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default RequireRole
