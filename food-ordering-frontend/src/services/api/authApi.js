import { axiosClient } from './axiosClient'

export const authApi = {
  signup: (payload) => axiosClient.post('/auth/signup', payload),
  signupAdmin: (payload) => axiosClient.post('/auth/signup/admin', payload),
  signin: (payload) => axiosClient.post('/auth/signin', payload),
  profile: () => axiosClient.get('/api/users/profile'),
}
