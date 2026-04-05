import { createSlice } from '@reduxjs/toolkit'

const menuSlice = createSlice({
  name: 'menu',
  initialState: null,
  reducers: {
    setPosition(state, action) {
      return { ...state, position: action.payload }
    },
  },
})

export const { setPosition } = menuSlice.actions
export default menuSlice.reducer
