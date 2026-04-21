import { axiosClient } from './axiosClient'

export const restaurantApi = {
  list: () => axiosClient.get('/api/restaurants'),
  byId: (id) => axiosClient.get(`/api/restaurants/${id}`),
  search: (keyword) => axiosClient.get('/api/restaurants/search', { params: { keyword } }),
  toggleFavorite: (id) => axiosClient.put(`/api/restaurants/${id}/add-favourites`),
}
