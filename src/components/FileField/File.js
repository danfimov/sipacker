import React from 'react'
import PropTypes from 'prop-types'
import styles from './styles.module.scss'
import { generateWaveform } from 'utils'
import useSize from '@react-hook/size'

File.propTypes =
  Image.propTypes =
  Audio.propTypes =
  Video.propTypes =
    {
      src: PropTypes.object,
      srcUrl: PropTypes.string,
      onClick: PropTypes.func,
      label: PropTypes.string,
      type: PropTypes.string,
    }
const types = {
  image: Image,
  audio: Audio,
  video: Video,
}
export default function File(props) {
  const component = { rendered: types[props.type] }
  return <component.rendered {...props} />
}

function Image(props) {
  return (
    <div
      onClick={props.onClick}
      onKeyDown={e => e.key === 'Enter' && props.onClick?.()}
      role='button'
      tabIndex={0}
      className={[styles.file, styles.image].join(' ')}
    >
      <img
        src={props.srcUrl}
        alt={props.srcUrl ? `Изображение для поля ${props.label} с именем «${props.src.name}»` : ''}
        className={[styles.file, styles.image].join(' ')}
        style={{ pointerEvents: 'none' }}
      />
    </div>
  )
}

function Audio(props) {
  const [peaksImage, setPeaksImage] = React.useState()
  const ref = React.useRef()
  const [width] = useSize(ref)

  React.useEffect(() => {
    if (!width) return
    let cleanup = () => {}
    generateWaveform(width, width, props.srcUrl).then(blob => {
      if (!blob) return

      const url = URL.createObjectURL(blob)
      setPeaksImage(url)
      cleanup = () => URL.revokeObjectURL(url)
    })
    return () => cleanup()
  }, [props.srcUrl, width])

  return (
    <div ref={ref}>
      <div
        onClick={props.onClick}
        onKeyDown={e => e.key === 'Enter' && props.onClick?.()}
        role='button'
        tabIndex={0}
        className={styles.file}
      >
        <img
          src={peaksImage}
          alt={
            props.srcUrl
              ? `Волноформа аудио-файла для поля ${props.label} с именем «${props.src.name}»`
              : ''
          }
          style={{ pointerEvents: 'none', width: '100%' }}
        />
      </div>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio src={props.srcUrl}></audio>
    </div>
  )
}

function Video(props) {
  return (
    <div>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        src={props.srcUrl}
        onClick={props.onClick}
        onKeyDown={e => e.key === 'Enter' && props.onClick?.()}
        role='button'
        tabIndex={0}
        className={styles.file}
        onCanPlay={e => (e.target.playbackRate = 2)}
        loop
        autoPlay
        muted
      ></video>
    </div>
  )
}
