import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { setSession } from '../../features/auth/authSlice'
import { useAppDispatch } from '../../hooks/useAppDispatch'
import { useAppSelector } from '../../hooks/useAppSelector'
import { authApi } from '../../services/api/authApi'
import Navbar from './Navbar'

function AppLayout() {
  const dispatch = useAppDispatch()
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    if (!token || isAuthenticated) {
      return
    }

    authApi
      .profile()
      .then((response) => {
        dispatch(setSession({ token, user: response.data }))
      })
      .catch(() => {
        localStorage.removeItem('auth_token')
      })
  }, [dispatch, isAuthenticated])

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto w-full max-w-[1460px] px-5 py-7">
        <Outlet />
      </main>
    </div>
  )
}

export default AppLayout
