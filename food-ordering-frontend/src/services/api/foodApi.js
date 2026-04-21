import { axiosClient } from './axiosClient'

export const foodApi = {
  search: (name) => axiosClient.get('/api/food/search', { params: { name } }),
  byRestaurant: (restaurantId, filters = {}) =>
    axiosClient.get(`/api/food/restaurant/${restaurantId}`, {
      params: {
        vegetarian: filters.vegetarian ?? false,
        nonveg: filters.nonveg ?? false,
        seasonal: filters.seasonal ?? false,
        food_category: filters.foodCategory || undefined,
      },
    }),
}
