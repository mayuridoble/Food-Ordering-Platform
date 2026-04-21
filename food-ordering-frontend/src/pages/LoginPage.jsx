import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { authApi } from '../services/api/authApi'
import { setSession } from '../features/auth/authSlice'
import { useAppDispatch } from '../hooks/useAppDispatch'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import { useToast } from '../components/ui/ToastProvider'

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const toast = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const { register, handleSubmit } = useForm({
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (values) => {
    setSubmitError('')
    setIsSubmitting(true)
    try {
      const { data } = await authApi.signin(values)
      const token = data.jwt

      if (!token) {
        throw new Error('Token missing in login response')
      }

      localStorage.setItem('auth_token', token)
      const profileResponse = await authApi.profile()

      dispatch(
        setSession({
          user: profileResponse.data,
          token,
        }),
      )
      toast.success('Welcome back!')
      navigate(location.state?.from?.pathname || '/')
    } catch (error) {
      setSubmitError(
        error?.response?.data?.message ||
          error?.message ||
          'Unable to login. Please try again.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="mx-auto max-w-md">
      <h1 className="text-2xl font-semibold text-slate-900">Welcome back</h1>
      <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Input
          placeholder="Email"
          type="email"
          required
          {...register('email')}
        />
        <Input
          placeholder="Password"
          type="password"
          required
          {...register('password')}
        />
        {submitError ? (
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {submitError}
          </p>
        ) : null}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>
      <p className="mt-4 text-sm text-slate-600">
        New here?{' '}
        <Link to="/signup" className="font-medium text-slate-900">
          Create account
        </Link>
      </p>
    </Card>
  )
}

export default LoginPage
