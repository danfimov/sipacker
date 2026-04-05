import React from 'react'
import PropTypes from 'prop-types'
import styles from './styles.module.scss'
import IconButton from '@mui/material/IconButton'
import { MdInfoOutline, MdDelete, MdPlayCircleOutline } from 'react-icons/md'
import { RiStopCircleLine } from 'react-icons/ri'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import Button from '@mui/material/Button'
import { filesize, getType, formatDate, generateWaveform } from 'utils'
import { deleteFile } from 'localStorage/fileStorage'
import { useDispatch } from 'react-redux'
import { fileUnlinked } from 'store/fileRenderingSlice'
import { ContextMenuActions } from 'components/ContextMenu'
import cx from 'classnames'
import unknownFileType from 'assets/unknownFileType.svg'
import useSize from '@react-hook/size'

File.propTypes = {
  file: PropTypes.object,
  handleSelect: PropTypes.func,
  onRemove: PropTypes.func,
  disabled: PropTypes.bool,
}

export default function File(props) {
  const [fileSrc, setFileSrc] = React.useState()
  const [previewSrc, setPreviewSrc] = React.useState()
  const [infoDialogueOpen, setInfoDialogueOpen] = React.useState(false)
  const [isPlayingFile, setIsPlayingFile] = React.useState(false)
  const [removing, setRemoving] = React.useState(false)
  const contextMenuActions = React.useContext(ContextMenuActions)
  const sizeRef = React.useRef(null)
  const [width, height] = useSize(sizeRef)
  const audioRef = React.useRef()
  const dispatch = useDispatch()

  React.useEffect(() => {
    const url = props.file.url
    if (url) {
      setFileSrc(props.file.type === 'unknown' ? unknownFileType : url)
    } else {
      const src = URL.createObjectURL(props.file.miniature ?? props.file.blob)
      setFileSrc(src)
      return () => URL.revokeObjectURL(src)
    }
  }, [props.file.blob, props.file.url, props.file.type, props.file.miniature])

  React.useEffect(() => {
    let cleanup = () => {}
    if (!width || !height) return
    switch (props.file.type) {
      case 'audio':
        generateWaveform(width, height, fileSrc).then(blob => {
          if (!blob) return

          const url = URL.createObjectURL(blob)
          setPreviewSrc(url)
          cleanup = () => URL.revokeObjectURL(url)
        })
        break

      case 'image':
      case 'video':
        setPreviewSrc(fileSrc)
        break
    }
    return () => cleanup()
  }, [width, height, fileSrc, props.file.type])

  const handleSelect = () => props.handleSelect(props.file.fileURI)

  const handleShowInfo = e => {
    e.stopPropagation()
    setInfoDialogueOpen(true)
  }

  const handleCloseInfo = e => {
    if (removing) return false
    e.stopPropagation()
    setInfoDialogueOpen(false)
  }

  const handleDeleteFile = async () => {
    const fileURI = props.file.fileURI
    setRemoving(true)
    await deleteFile(fileURI)
    dispatch(fileUnlinked({ fileURI }))
    setRemoving(false)
    setInfoDialogueOpen(false)
    props.onRemove()
  }

  const handleOpenMenu = e => {
    contextMenuActions.open(e, [
      { name: 'Удалить', icon: <MdDelete />, action: () => handleDeleteFile() },
    ])
  }

  const handlePlayStop = e => {
    e.stopPropagation()
    setIsPlayingFile(!isPlayingFile)
    if (isPlayingFile) audioRef.current.stop()
    else audioRef.current.play()
  }

  return (
    <>
      <div
        className={cx(styles.item, { [styles.disabled]: props.disabled })}
        onClick={handleSelect}
        onContextMenu={handleOpenMenu}
        role='button'
        tabIndex={0}
        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleSelect()}
      >
        <div className={styles.itemInner}>
          <div className={styles.buttons}>
            <IconButton className={styles.button} size='small' onClick={handleShowInfo}>
              <MdInfoOutline />
            </IconButton>
            {props.file.type === 'audio' && (
              <IconButton className={styles.button} size='small' onClick={handlePlayStop}>
                {isPlayingFile ? <RiStopCircleLine /> : <MdPlayCircleOutline />}
              </IconButton>
            )}
          </div>
          <div className={styles.preview} ref={sizeRef}>
            {previewSrc && props.file.type !== 'video' && (
              <img src={previewSrc} alt='' className={styles.foreground} />
            )}
            {props.file.type === 'image' && (
              <img src={previewSrc} alt='' className={styles.background} />
            )}
            {props.file.type === 'video' && (
              <video
                src={previewSrc}
                loop
                autoPlay
                muted
                className={styles.video}
                onCanPlay={e => (e.target.playbackRate = 2)}
              >
                <track kind='captions' />
              </video>
            )}
          </div>
          <audio src={fileSrc} ref={audioRef} onEnded={() => setIsPlayingFile(false)}>
            <track kind='captions' />
          </audio>
          <div className={styles.fileName}>{props.file.fileName}</div>
        </div>
      </div>
      <Dialog open={infoDialogueOpen} onClose={handleCloseInfo}>
        <DialogTitle className={styles.title}>Информация о файле {props.file.fileName}</DialogTitle>
        <DialogContent>
          <p>
            Тип: <b>{getType(props.file.blob?.type)}</b>
          </p>
          <p>
            Размер файла: <b>{filesize(props.file.size)}</b>
          </p>
          <p>
            Дата добавления: <b>{formatDate(new Date(props.file.addedAt))}</b>
          </p>
          {props.file.url && (
            <p>
              Адрес файла:
              <b>
                <a target='_blank' href={props.file.url} rel='noreferrer' className={styles.link}>
                  {props.file.url}
                </a>
              </b>
            </p>
          )}
          <Button
            variant='contained'
            className={styles.delete}
            onClick={handleDeleteFile}
            disabled={removing}
          >
            Удалить файл
          </Button>
        </DialogContent>
      </Dialog>
    </>
  )
}
