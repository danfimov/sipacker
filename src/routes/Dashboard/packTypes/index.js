import React from 'react'
import styles from '../styles.module.scss'
import PropTypes from 'prop-types'
import { BsPlus } from 'react-icons/bs'
import Skeleton from '@mui/material/Skeleton'

import { getFile } from 'localStorage/fileStorage'
export { default as Upload } from './Upload'
export { default as ImportByURL } from './ImportByURL'
export { default as Pack } from './Pack'
import { useDispatch } from 'react-redux'
import {
  fileRenderingStarted,
  fileRenderingStopped,
  setFileUnlinkCallback,
} from 'store/fileRenderingSlice'
import unknownFileType from 'assets/unknownFileType.svg'

export function Create() {
  return (
    <div className={[styles.packBase, styles.newPack].join(' ')}>
      <span>
        <BsPlus /> Создать новый пак
      </span>
    </div>
  )
}

Loading.propTypes = { name: PropTypes.string }
export function Loading(props) {
  return (
    <div className={[styles.packBase, styles.loading].join(' ')}>
      <Skeleton variant='rectangular' width='100%' height='100%' className={styles.skeleton} />
      {props.name && <span>Загрузка «{props.name}»</span>}
    </div>
  )
}

PackImage.propTypes = {
  src: PropTypes.string,
}

function PackImage(props) {
  const [src, setSrc] = React.useState()
  const dispatch = useDispatch()

  React.useEffect(() => {
    if (!src) return
    dispatch(setFileUnlinkCallback({ fileURI: props.src, callback: () => setSrc() }))
  }, [src, dispatch, props.src])

  React.useEffect(() => {
    let cleanup = () => {}
    if (props.src) {
      (async () => {
        const file = await getFile(props.src)
        if (file === null) return setSrc()

        if (file.url) {
          setSrc(file.type === 'unknown' ? unknownFileType : file.url)
        } else {
          const src = URL.createObjectURL(file.blob)
          setSrc(src)
        }
        dispatch(fileRenderingStarted({ fileURI: props.src, callback: () => setSrc() }))

        cleanup = () => {
          src?.startsWith('blob:') && URL.revokeObjectURL(src)
          dispatch(fileRenderingStopped({ fileURI: props.src }))
        }
      })()
    } else {
      setSrc()
    }
    return () => cleanup()
  }, [props.src, dispatch, src])

  return (
    <div className={styles.pictureContainer}>
      {src ? (
        <img src={src} alt='' className={styles.thumbnail} />
      ) : (
        <div className={styles.thumbnail} />
      )}
    </div>
  )
}

export default PackImage
