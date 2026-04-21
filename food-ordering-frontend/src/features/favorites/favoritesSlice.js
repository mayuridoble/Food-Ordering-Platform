import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  restaurants: [],
}

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    setFavorites: (state, action) => {
      state.restaurants = action.payload ?? []
    },
  },
})

export const { setFavorites } = favoritesSlice.actions
export default favoritesSlice.reducer
