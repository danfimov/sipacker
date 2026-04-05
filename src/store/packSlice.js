import { createSlice } from '@reduxjs/toolkit'

const packSlice = createSlice({
  name: 'pack',
  initialState: null,
  reducers: {
    loadPack(state, action) {
      return action.payload
    },
  },
})

export const { loadPack } = packSlice.actions
export default packSlice.reducer
