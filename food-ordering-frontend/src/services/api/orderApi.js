import { axiosClient } from './axiosClient'

export const orderApi = {
  create: (payload) => axiosClient.post('/api/order', payload),
  listByUser: () => axiosClient.get('/api/order/user'),
}
