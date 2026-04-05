import { createAction, createReducer } from '@reduxjs/toolkit'

export const fileRenderingStarted = createAction('fileRendering/fileRenderingStarted')
export const fileRenderingStopped = createAction('fileRendering/fileRenderingStopped')
export const fileUnlinked = createAction('fileRendering/fileUnlinked')
export const setFileUnlinkCallback = createAction('fileRendering/setFileUnlinkCallback')

// Cannot use Immer here because state contains function values
const fileRenderingReducer = createReducer({}, builder => {
  builder
    .addCase(fileRenderingStarted, (state, action) => {
      const { fileURI, callback } = action.payload
      if (state[fileURI]) return state
      return { ...state, [fileURI]: callback }
    })
    .addCase(fileRenderingStopped, (state, action) => {
      const { fileURI } = action.payload
      const newState = { ...state }
      delete newState[fileURI]
      return newState
    })
    .addCase(fileUnlinked, (state, action) => {
      const { fileURI } = action.payload
      if (!Object.keys(state).includes(fileURI)) return state
      const callback = state[fileURI]
      callback && callback()
      const newState = { ...state }
      delete newState[fileURI]
      return newState
    })
    .addCase(setFileUnlinkCallback, (state, action) => {
      const { fileURI, callback } = action.payload
      return { ...state, [fileURI]: callback }
    })
})

export default fileRenderingReducer
