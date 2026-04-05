import { createSlice } from '@reduxjs/toolkit'

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: null,
  reducers: {
    setUploading(state, action) {
      return { ...state, uploading: action.payload }
    },
  },
})

export const { setUploading } = dashboardSlice.actions
export default dashboardSlice.reducer
