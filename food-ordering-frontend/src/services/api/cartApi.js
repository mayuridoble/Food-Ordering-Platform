import { axiosClient } from './axiosClient'

export const cartApi = {
  get: () => axiosClient.get('/api/cart'),
  add: (payload) => axiosClient.put('/api/cart/add', payload),
  update: (payload) => axiosClient.put('/api/cart-item/update', payload),
  remove: (id) => axiosClient.delete(`/api/cart-item/${id}/remove`),
  clear: () => axiosClient.put('/api/cart/clear'),
}
