import React from 'react'
import clone from 'just-clone'
import { v4 as uuidv4 } from 'uuid'
import PropTypes from 'prop-types'
import styles from './styles.module.scss'
import Typography from '@mui/material/Typography'
import ItemsList from 'components/ItemsList'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import ScenarioEvent from './ScenarioEvent'
import {
  MdImage,
  MdMusicNote,
  MdVideocam,
  MdShortText,
  MdRecordVoiceOver,
  MdFlag,
  MdUnfoldMore,
  MdUnfoldLess,
} from 'react-icons/md'
import { scenarioHint } from './hints'
import WithHint from './WithHint'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router'
import { saveLocalPack } from 'localStorage/localPacks'
import { loadPack } from 'store/packSlice'

const Scenario = React.forwardRef(
  ({ formik, newQuestion, newQuestionScenario, setNewQuestionScenario }, ref) => {
    const [scenario, setScenario] = React.useState([])
    const [initialized, setInitialized] = React.useState(false)
    const [scenarioUpdateTimeout, setScenarioUpdateTimeout] = React.useState()
    const [expandAll, setExpandAll] = React.useState(() => {
      const saved = localStorage.getItem('sipacker_scenario_expand_all')
      return saved ? JSON.parse(saved) : false
    })
    const params = useParams()
    const dispatch = useDispatch()
    const pack = useSelector(state => state.pack)
    const round = params.roundIndex
    const questionPrice = params.questionPrice
    const questions = pack.rounds[round - 1].themes[params.themeIndex - 1].questions
    const question = newQuestion
      ? null
      : questions[questions.findIndex(({ price }) => price === Number(questionPrice))]
    React.useEffect(() => {
      if (newQuestion) {
        setScenario(newQuestionScenario)
        setInitialized(true)
        return
      }
      if (!question?.scenario) {
        setInitialized(true)
        return
      }
      const withIds = clone(question.scenario).map(event => ({
        ...event,
        _id: event._id ?? uuidv4(),
      }))
      setScenario(withIds)
      setInitialized(true)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [question?.scenario, newQuestion, newQuestionScenario])

    const handleExpandAllChange = event => {
      const newValue = event.target.checked
      setExpandAll(newValue)
      localStorage.setItem('sipacker_scenario_expand_all', JSON.stringify(newValue))
    }

    const updateQuestionScenario = React.useCallback(
      async scenario => {
        if (newQuestion) {
          setNewQuestionScenario(scenario)
          return
        }
        const currentPack = clone(pack)
        const roundIdx = params.roundIndex - 1
        const questions = currentPack.rounds[roundIdx].themes[params.themeIndex - 1].questions
        const question =
          questions[questions.findIndex(({ price }) => price === Number(questionPrice))]
        if (!question) return
        question.scenario = scenario
        await saveLocalPack(currentPack)
        dispatch(loadPack(currentPack))
      },
      [
        pack,
        params.roundIndex,
        params.themeIndex,
        questionPrice,
        dispatch,
        newQuestion,
        setNewQuestionScenario,
      ]
    )

    React.useEffect(() => {
      if (!initialized) return
      clearTimeout(scenarioUpdateTimeout)
      const scenarioUpdateQueue = setTimeout(() => updateQuestionScenario(scenario), 1000)
      setScenarioUpdateTimeout(scenarioUpdateQueue)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scenario, updateQuestionScenario, initialized])

    React.useImperativeHandle(ref, () => ({
      getScenario() {
        clearTimeout(scenarioUpdateTimeout)
        return scenario
      },
    }))

    const reorder = (list, startIndex, endIndex) => {
      const result = Array.from(list)
      const [removed] = result.splice(startIndex, 1)
      result.splice(endIndex, 0, removed)
      return result
    }

    const onDragEnd = result => {
      if (!result.destination) return
      const items = reorder(scenario, result.source.index, result.destination.index)
      setScenario(items)
    }

    const handleAddEvent = eventType => {
      setScenario([...scenario, { _id: uuidv4(), type: eventType, duration: 3, data: {} }])
    }

    const handleDelete = index => {
      const newScenario = [...scenario]
      newScenario.splice(index, 1)
      setScenario(newScenario)
    }

    const handleChangeDuration = (index, value) => {
      const newScenario = [...scenario]
      newScenario[index] = { ...newScenario[index], duration: value }
      setScenario(newScenario)
    }

    const handleChangeData = (index, data) => {
      const newScenario = [...scenario]
      newScenario[index] = { ...newScenario[index], data }
      setScenario(newScenario)
    }

    return (
      <div className={styles.scenario}>
        <div className={styles.scenarioHeader}>
          <WithHint hint={scenarioHint}>
            <Typography variant='h6'>Сценарий</Typography>
          </WithHint>
          {scenario.length > 0 && (
            <Tooltip title={expandAll ? 'Свернуть всё' : 'Развернуть всё'}>
              <IconButton
                onClick={() => handleExpandAllChange({ target: { checked: !expandAll } })}
                size='small'
              >
                {expandAll ? <MdUnfoldLess /> : <MdUnfoldMore />}
              </IconButton>
            </Tooltip>
          )}
        </div>
        {scenario.length < 100 && (
          <div className={styles.addEventButtons}>
            <Button
              variant='contained'
              startIcon={<MdShortText />}
              onClick={() => handleAddEvent('text')}
              sx={{ backgroundColor: '#2196f3', '&:hover': { backgroundColor: '#1976d2' } }}
            >
              Текст
            </Button>
            <Button
              variant='contained'
              startIcon={<MdRecordVoiceOver />}
              onClick={() => handleAddEvent('say')}
              sx={{ backgroundColor: '#9c27b0', '&:hover': { backgroundColor: '#7b1fa2' } }}
            >
              Слово ведущего
            </Button>
            <Button
              variant='contained'
              startIcon={<MdImage />}
              onClick={() => handleAddEvent('image')}
              sx={{ backgroundColor: '#4caf50', '&:hover': { backgroundColor: '#388e3c' } }}
            >
              Изображение
            </Button>
            <Button
              variant='contained'
              startIcon={<MdMusicNote />}
              onClick={() => handleAddEvent('voice')}
              sx={{ backgroundColor: '#ff9800', '&:hover': { backgroundColor: '#f57c00' } }}
            >
              Аудио
            </Button>
            <Button
              variant='contained'
              startIcon={<MdVideocam />}
              onClick={() => handleAddEvent('video')}
              sx={{ backgroundColor: '#f44336', '&:hover': { backgroundColor: '#d32f2f' } }}
            >
              Видео
            </Button>
            <Button
              variant='outlined'
              startIcon={<MdFlag />}
              onClick={() => handleAddEvent('marker')}
              sx={{ borderColor: '#757575', color: '#757575' }}
            >
              [Игроки отвечают]
            </Button>
          </div>
        )}
        <ItemsList
          droppableId='scenario'
          onDragEnd={onDragEnd}
          list={scenario}
          draggableProps={{
            onDelete: handleDelete,
            formik,
            onChangeDuration: handleChangeDuration,
            onChangeData: handleChangeData,
            scenario,
            expandAll,
          }}
          noItemsLabel='Сценарий пуст'
          itemComponent={ScenarioEvent}
        />
      </div>
    )
  }
)

Scenario.propTypes = {
  formik: PropTypes.object,
  newQuestion: PropTypes.bool,
  newQuestionScenario: PropTypes.array,
  setNewQuestionScenario: PropTypes.func,
}
Scenario.displayName = 'Scenario'
export default Scenario
