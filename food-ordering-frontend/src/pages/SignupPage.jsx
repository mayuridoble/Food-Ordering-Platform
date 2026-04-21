import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../services/api/authApi'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import { useToast } from '../components/ui/ToastProvider'

function SignupPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const { register, handleSubmit, watch } = useForm({
    defaultValues: {
      accountType: 'customer',
      fullName: '',
      email: '',
      password: '',

      restaurantName: '',
      restaurantDescription: '',
      restaurantCuisineType: '',
      restaurantOpeningHours: '',
      restaurantImages: '',

      contactEmail: '',
      contactMobile: '',
      contactTwitter: '',
      contactInstagram: '',

      addressStreet: '',
      addressCity: '',
      addressState: '',
      addressPostalCode: '',
      addressCountry: '',
    },
  })

  const accountType = watch('accountType')
  const isAdminSignup = accountType === 'admin'

  const parseImages = (value) =>
    String(value || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

  const onSubmit = async (values) => {
    setSubmitError('')
    setIsSubmitting(true)
    try {
      if (values.accountType === 'admin') {
        await authApi.signupAdmin({
          fullName: values.fullName,
          email: values.email,
          password: values.password,
          restaurant: {
            name: values.restaurantName,
            description: values.restaurantDescription,
            cuisineTyoe: values.restaurantCuisineType,
            openingHours: values.restaurantOpeningHours,
            images: parseImages(values.restaurantImages),
            contactInformation: {
              email: values.contactEmail,
              mobile: values.contactMobile,
              twitter: values.contactTwitter,
              instagram: values.contactInstagram,
            },
            address: {
              streetAddress: values.addressStreet,
              city: values.addressCity,
              state: values.addressState,
              postalCode: values.addressPostalCode,
              country: values.addressCountry,
            },
          },
        })
        toast.success('Admin account created. Please sign in.')
      } else {
        await authApi.signup({
          fullName: values.fullName,
          email: values.email,
          password: values.password,
        })
        toast.success('Account created. Please sign in.')
      }
      navigate('/login')
    } catch (error) {
      setSubmitError(
        error?.response?.data?.message ||
          error?.message ||
          'Unable to create account. Please try again.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="mx-auto max-w-md">
      <h1 className="text-2xl font-semibold text-slate-900">Create account</h1>
      <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700">Sign up as</p>
          <div className="flex gap-2">
            <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm text-slate-700">
              <input
                type="radio"
                value="customer"
                {...register('accountType')}
              />
              User
            </label>
            <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm text-slate-700">
              <input
                type="radio"
                value="admin"
                {...register('accountType')}
              />
              Admin
            </label>
          </div>
        </div>

        <Input
          placeholder="Full name"
          required
          {...register('fullName')}
        />
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

        {isAdminSignup ? (
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white/60 p-4">
            <p className="text-sm font-semibold text-slate-900">Restaurant details</p>
            <Input
              placeholder="Restaurant name"
              required
              {...register('restaurantName')}
            />
            <Input
              placeholder="Description"
              required
              {...register('restaurantDescription')}
            />
            <Input
              placeholder="Cuisine type"
              required
              {...register('restaurantCuisineType')}
            />
            <Input
              placeholder="Opening hours (e.g., 10am - 10pm)"
              required
              {...register('restaurantOpeningHours')}
            />
            <Input
              placeholder="Image URLs (comma separated)"
              {...register('restaurantImages')}
            />

            <p className="text-sm font-semibold text-slate-900">Contact</p>
            <Input placeholder="Contact email" type="email" {...register('contactEmail')} />
            <Input placeholder="Mobile" {...register('contactMobile')} />
            <Input placeholder="Twitter" {...register('contactTwitter')} />
            <Input placeholder="Instagram" {...register('contactInstagram')} />

            <p className="text-sm font-semibold text-slate-900">Address</p>
            <Input placeholder="Street address" {...register('addressStreet')} />
            <Input placeholder="City" {...register('addressCity')} />
            <Input placeholder="State" {...register('addressState')} />
            <Input placeholder="Postal code" {...register('addressPostalCode')} />
            <Input placeholder="Country" {...register('addressCountry')} />
          </div>
        ) : null}

        {submitError ? (
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {submitError}
          </p>
        ) : null}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting
            ? 'Creating account...'
            : isAdminSignup
              ? 'Create admin account'
              : 'Create account'}
        </Button>
      </form>
      <p className="mt-4 text-sm text-slate-600">
        Already registered?{' '}
        <Link to="/login" className="font-medium text-slate-900">
          Login
        </Link>
      </p>
    </Card>
  )
}

export default SignupPage
