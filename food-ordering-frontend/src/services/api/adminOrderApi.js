import { axiosClient } from './axiosClient'

export const adminOrderApi = {
  listByRestaurant: (restaurantId, orderStatus) =>
    axiosClient.get(`/api/admin/order/restaurant/${restaurantId}`, {
      params: {
        order_status: orderStatus || undefined,
      },
    }),
  updateStatus: (orderId, orderStatus) =>
    axiosClient.put(`/api/admin/order/${orderId}/${orderStatus}`),
}
