import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  list: [],
  selected: null,
}

const restaurantSlice = createSlice({
  name: 'restaurant',
  initialState,
  reducers: {
    setRestaurants: (state, action) => {
      state.list = action.payload ?? []
    },
    setSelectedRestaurant: (state, action) => {
      state.selected = action.payload ?? null
    },
  },
})

export const { setRestaurants, setSelectedRestaurant } = restaurantSlice.actions
export default restaurantSlice.reducer
