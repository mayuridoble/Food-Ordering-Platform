import { axiosClient } from './axiosClient'

export const adminFoodApi = {
  create: (payload) => axiosClient.post('/api/admin/food', payload),
}
