import { axiosClient } from './axiosClient'

export const ingredientApi = {
  byRestaurant: (id) => axiosClient.get(`/api/admin/ingredients/restaurant/${id}`),
  categoriesByRestaurant: (id) =>
    axiosClient.get(`/api/admin/ingredients/restaurant/${id}/category`),
}
