import React from 'react'
import PropTypes from 'prop-types'
import styles from './styles.module.scss'
import {
  MdDelete,
  MdExpandMore,
  MdImage,
  MdMusicNote,
  MdVideocam,
  MdShortText,
  MdRecordVoiceOver,
} from 'react-icons/md'
import Item from 'components/ItemsList/Item'
import Handle from 'components/ItemsList/Handle'
import Typography from '@mui/material/Typography'

import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import TextField from '@mui/material/TextField'
import FileField from 'components/FileField'
import Fade from '@mui/material/Fade'

ScenarioEvent.propTypes = {
  index: PropTypes.number,
  item: PropTypes.object,
  onDelete: PropTypes.func,
  onChangeDuration: PropTypes.func,
  onChangeData: PropTypes.func,
  draggableId: PropTypes.string,
  formik: PropTypes.object,
  scenario: PropTypes.array,
  expandAll: PropTypes.bool,
}

export default function ScenarioEvent(props) {
  const [duration, setDuration] = React.useState(() => props.scenario?.[props.index]?.duration)
  const [eventData, setEventData] = React.useState(() => props.scenario?.[props.index]?.data)
  const [expand, setExpand] = React.useState(false)
  const isMounted = React.useRef(false)
  const isDataMounted = React.useRef(false)
  const formatTime = time => `${time.toFixed(1)} cек.`

  const handleDelete = e => {
    e.stopPropagation()
    props.onDelete(props.index)
  }

  React.useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true
      return
    }
    if (props.index !== undefined && duration !== undefined)
      props.onChangeDuration(props.index, duration)
  }, [duration]) // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    const scenarioEvent = props.scenario[props.index]
    if (!scenarioEvent) return
    const data = scenarioEvent.data
    const eventDuration = scenarioEvent.duration
    setEventData(data)
    setDuration(eventDuration)
  }, [props.scenario, props.index])

  React.useEffect(() => {
    if (!isDataMounted.current) {
      isDataMounted.current = true
      return
    }
    if (!eventData) return
    const rafId = requestAnimationFrame(() => props.onChangeData(props.index, eventData))
    return () => cancelAnimationFrame(rafId)
  }, [eventData]) // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    if (props.expandAll !== undefined) {
      setExpand(props.expandAll)
    }
  }, [props.expandAll])

  return (
    <Item index={props.index} draggableId={props.draggableId.toString()}>
      {provided => (
        <Accordion expanded={expand} onChange={(_, expanded) => setExpand(expanded)}>
          <AccordionSummary expandIcon={<MdExpandMore />}>
            <div className={styles.item}>
              <Handle provided={provided} />
              <Typography variant='body1' className={styles.itemType}>
                {{
                  image: 'Изображение',
                  voice: 'Аудио',
                  video: 'Видео',
                  text: 'Текст',
                  say: 'Слово ведущего',
                  marker: <i>[Игроки отвечают]</i>,
                }[props.item.type] ?? `Событие «${props.item.type}»`}
                <span className={styles.spacing} />
                {
                  {
                    image: <MdImage />,
                    voice: <MdMusicNote />,
                    video: <MdVideocam />,
                    text: <MdShortText />,
                    say: <MdRecordVoiceOver />,
                  }[props.item.type]
                }
              </Typography>
              {props.item.type !== 'marker' && (
                <Fade in={!expand}>
                  <Typography variant='body2' color='text.secondary'>
                    {formatTime(props.item.duration)}
                  </Typography>
                </Fade>
              )}
              <div
                role='button'
                aria-label='Удалить событие'
                tabIndex={0}
                onClick={handleDelete}
                onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleDelete(e)}
                className={styles.deleteBtn}
              >
                <MdDelete />
              </div>
            </div>
          </AccordionSummary>
          <AccordionDetails>
            <div className={styles.details}>
              <div className={styles.contentRow}>
                <div className={styles.eventContent}>
                  {
                    {
                      text: (
                        <TextField
                          value={eventData?.text ?? ''}
                          onChange={e => setEventData({ text: e.target.value })}
                          label='Введите текст'
                          multiline
                          rows={4}
                          fullWidth
                        />
                      ),
                      image: (
                        <FileField
                          type='image'
                          value={eventData?.imageField}
                          onChange={newValue => setEventData({ imageField: newValue })}
                        />
                      ),
                      voice: (
                        <FileField
                          type='audio'
                          value={eventData?.audioField}
                          onChange={newValue => setEventData({ audioField: newValue })}
                        />
                      ),
                      video: (
                        <FileField
                          type='video'
                          value={eventData?.videoField}
                          onChange={newValue => setEventData({ videoField: newValue })}
                        />
                      ),
                      say: (
                        <TextField
                          value={eventData?.say ?? ''}
                          onChange={e => setEventData({ say: e.target.value })}
                          label='Фраза, которую произносит ведущий'
                          multiline
                          rows={4}
                          fullWidth
                        />
                      ),
                      marker: (
                        <Typography variant='caption'>
                          Все события, идущие после этого, будут проигрываться после ответа игрока.
                        </Typography>
                      ),
                    }[props.item.type]
                  }
                </div>
                {props.item.type !== 'marker' && (
                  <div className={styles.timeField}>
                    <TextField
                      label='Время (сек)'
                      variant='outlined'
                      size='small'
                      type='number'
                      InputProps={{ inputProps: { min: 0.1, max: 60, step: 0.1 } }}
                      fullWidth
                      value={duration}
                      onChange={e => setDuration(Number(e.target.value))}
                    />
                  </div>
                )}
              </div>
            </div>
          </AccordionDetails>
        </Accordion>
      )}
    </Item>
  )
}
