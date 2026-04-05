import React from 'react'
import PropTypes from 'prop-types'
import * as yup from 'yup'
import clone from 'just-clone'
import styles from './styles.module.scss'
import { useFormik } from 'formik'
import { useParams, useNavigate } from 'react-router'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { useBeforeUnload } from '../../../../hooks/useBeforeUnload'
import FormFields from './FormFields'
import Scenario from './Scenario'
import { initValues } from 'utils'
import { useDispatch, useSelector } from 'react-redux'
import { saveLocalPack, loadLocalPack } from 'localStorage/localPacks'
import { validate } from './validation'
import { loadPack } from 'store/packSlice'

const priceSchema = yup
  .number()
  .integer()
  .min(1, 'Стоимость вопроса должна быть больше 0')
  .max(4294967295) // max of uint32

const validationSchema = yup.object({
  price: priceSchema.required('Выберите стоимость вопроса'),
  realprice: priceSchema,
  realtheme: yup.string(),
  type: yup.string().default('simple').required('Выберите тип вопроса'),
  transferToSelf: yup.bool(),
  detailsDisclosure: yup.string(),
  realpriceFrom: yup.number(),
  realpriceTo: yup.number(),
  realpriceStep: yup.number(),
  correctAnswers: yup
    .array()
    .ensure()
    .min(1, 'Добавьте как минимум один правильный ответ')
    .required('Добавьте как минимум один правильный ответ'),
  incorrectAnswers: yup.array().ensure(),
})

QuestionContent.propTypes = {
  data: PropTypes.object,
}

function QuestionContent(props) {
  const navigate = useNavigate()
  const params = useParams()
  const dispatch = useDispatch()
  const pack = useSelector(state => state.pack)
  const round = params.roundIndex
  const questionPrice = params.questionPrice
  const questions = pack.rounds[round - 1].themes[params.themeIndex - 1].questions
  const newQuestion = questionPrice === 'add'
  const scenarioRef = React.useRef()
  const [newQuestionScenario, setNewQuestionScenario] = React.useState([])

  const getNextPrice = questions => {
    const findRegularity = () => {
      let delta
      for (let i = 1; i < questions.length; i++) {
        let newDelta = questions[i].price - questions[i - 1].price
        if (delta !== undefined && delta !== newDelta) return undefined
        else delta = newDelta
      }
      return questions[questions.length - 1].price + delta
    }

    const add100 = () => {
      return questions[questions.length - 1].price + 100
    }

    return questions.length === 0 ? 100 : findRegularity() || add100()
  }
  const initialValues = initValues(
    validationSchema,
    newQuestion ? { ...props.data, price: getNextPrice(questions), type: 'simple' } : props.data
  )
  const formik = useFormik({
    initialValues,
    validate: values => validate(values, { pack }, params),
    validationSchema,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: async (values, { resetForm }) => {
      const theme = params.themeIndex
      const question = {
        ...values,
        scenario: scenarioRef.current?.getScenario() || [],
      }
      // Читаем актуальный пак из IndexedDB, чтобы не затереть параллельно сохранённые вопросы
      const freshPack = await loadLocalPack(pack.uuid)
      const currentPack = freshPack ?? clone(pack)
      const questions = [...currentPack.rounds[round - 1].themes[theme - 1].questions, question]
      currentPack.rounds[round - 1].themes[theme - 1].questions = questions.sort(
        (a, b) => a.price - b.price
      )
      await saveLocalPack(currentPack)
      dispatch(loadPack(currentPack))
      navigate(
        `/pack/${currentPack.uuid}/rounds/${round}/themes/${theme}/questions/${question.price}`
      )
      resetForm({ values })
    },
  })

  const submitting = formik.isSubmitting

  // Auto-save for existing questions
  React.useEffect(() => {
    if (newQuestion || !Object.keys(formik.touched).length) return
    const timeout = setTimeout(async () => {
      const currentPack = clone(pack)
      const theme = params.themeIndex
      const question = {
        ...props.data,
        ...formik.values,
        scenario: scenarioRef.current?.getScenario() || props.data.scenario,
      }
      const questions = [...currentPack.rounds[round - 1].themes[theme - 1].questions]
      const questionIndex = questions.findIndex(({ price }) => price === Number(questionPrice))
      questions[questionIndex] = question
      currentPack.rounds[round - 1].themes[theme - 1].questions = questions.sort(
        (a, b) => a.price - b.price
      )
      await saveLocalPack(currentPack)
      dispatch(loadPack(currentPack))
    }, 1000)
    return () => clearTimeout(timeout)
  }, [
    formik.values,
    formik.touched,
    newQuestion,
    pack,
    props.data,
    params.themeIndex,
    params.roundIndex,
    questionPrice,
    round,
    dispatch,
  ])

  useBeforeUnload(newQuestion && Object.keys(formik.touched).length > 0)

  return (
    <div className={styles.container}>
      <form onSubmit={formik.handleSubmit} className={styles.form}>
        {!newQuestion && (
          <Typography variant='body2' color='text.secondary' sx={{ marginBottom: 2 }}>
            Все изменения сохраняются автоматически
          </Typography>
        )}
        <FormFields formik={formik} submitting={submitting} />
        <Scenario
          formik={formik}
          submitting={formik.isValidating || submitting}
          ref={scenarioRef}
          newQuestion={newQuestion}
          newQuestionScenario={newQuestionScenario}
          setNewQuestionScenario={setNewQuestionScenario}
        />
        {newQuestion && (
          <Button
            color='primary'
            variant='contained'
            type='submit'
            disabled={submitting}
            className={styles.submit}
          >
            Добавить вопрос
          </Button>
        )}
      </form>
    </div>
  )
}

export default QuestionContent
