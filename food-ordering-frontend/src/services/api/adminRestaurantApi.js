import { axiosClient } from './axiosClient'

export const adminRestaurantApi = {
  myRestaurant: () => axiosClient.get('/api/admin/restaurants/user'),
}
