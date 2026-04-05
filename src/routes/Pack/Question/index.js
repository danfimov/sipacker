import React from 'react'
import PropTypes from 'prop-types'
import { useParams } from 'react-router'
import { useSelector } from 'react-redux'
import NotFound404 from 'components/NotFound404'
import QuestionContent from './QuestionContent'

Question.propTypes = {
  data: PropTypes.object,
}
function Question() {
  const [notFound, setNotFound] = React.useState()
  const [question, setQuestion] = React.useState()
  const params = useParams()
  const pack = useSelector(state => state.pack)

  React.useEffect(() => {
    if (!pack) return setNotFound(true)
    const round = pack.rounds[params.roundIndex - 1]
    if (!round) return setNotFound(true)
    const theme = round.themes[params.themeIndex - 1]
    if (!theme) return setNotFound(true)
    if (params.questionPrice !== 'add') {
      const question = theme.questions.find(({ price }) => price === Number(params.questionPrice))
      if (!question) return setNotFound(true)
      setQuestion(question)
    }
    setNotFound(false)
  }, [params, pack])

  return (
    notFound !== undefined && (notFound ? <NotFound404 /> : <QuestionContent data={question} />)
  )
}

export default Question
