import { configureStore } from '@reduxjs/toolkit'
import packReducer from './packSlice'
import dashboardReducer from './dashboardSlice'
import fileRenderingReducer from './fileRenderingSlice'
import menuReducer from './menuSlice'

const store = configureStore({
  reducer: {
    pack: packReducer,
    dashboard: dashboardReducer,
    fileRendering: fileRenderingReducer,
    menu: menuReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false, // fileRendering state contains function callbacks
    }),
})

export default store
