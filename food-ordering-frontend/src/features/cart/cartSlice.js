import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  items: [],
  total: 0,
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCart: (state, action) => {
      state.items = action.payload.items ?? []
      state.total = action.payload.total ?? 0
    },
    clearCartState: (state) => {
      state.items = []
      state.total = 0
    },
  },
})

export const { setCart, clearCartState } = cartSlice.actions
export default cartSlice.reducer
