import React from 'react'
import PropTypes from 'prop-types'
import styles from './styles.module.scss'
import TableContainer from '@mui/material/TableContainer'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import { MdImage, MdDone, MdMusicNote, MdVideocam, MdAdd, MdDelete } from 'react-icons/md'
import { useNavigate, useParams } from 'react-router'
import { useSelector } from 'react-redux'
import { questionTypes } from 'utils'
import Typography from '@mui/material/Typography'
import DeleteConfirmationDialog from 'components/ConfirmationDialog/DeleteConfirmationDialog'
import { ContextMenuActions } from 'components/ContextMenu'

ItemContent.propTypes = {
  themeIndex: PropTypes.number,
  theme: PropTypes.object,
}

function ItemContent(props) {
  const navigate = useNavigate()
  const params = useParams()
  const pack = useSelector(state => state.pack)
  const confirmationDialogRef = React.useRef()
  const contextMenuActions = React.useContext(ContextMenuActions)

  const sortedQuestions = [...props.theme.questions].sort((a, b) => a.price - b.price)

  const questionType = type => questionTypes[type] || type

  const questionURL = `/pack/${params.packUUID}/rounds/${params.roundIndex}/themes/${props.themeIndex + 1}/questions`
  const handleOpenQuestion = price => () => navigate(`${questionURL}/${price}`)
  const row = { sx: { '&:last-child td, &:last-child th': { border: 0 } } }
  const cell1 = { component: 'th', scope: 'row' }

  const handleDeleteQuestion = async questionPrice => {
    const round = params.roundIndex - 1
    const themeIndex = props.themeIndex
    confirmationDialogRef.current.confirmDeleteQuestion(round, themeIndex, questionPrice)
  }

  const handleOpenMenu = price => e => {
    contextMenuActions.open(e, [
      { name: 'Удалить', icon: <MdDelete />, action: () => handleDeleteQuestion(price) },
    ])
  }

  // pack is used indirectly via DeleteConfirmationDialog which reads from the store
  void pack

  return (
    <>
      <TableContainer>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Цена</TableCell>
              <Cell wp={10}>Текст</Cell>
              <Cell wp={9}>Ответы</Cell>
              <Cell wp={4}>Вид вопроса</Cell>
              <Cell wp={1}>
                <MdImage />
              </Cell>
              <Cell wp={1}>
                <MdMusicNote />
              </Cell>
              <Cell wp={1}>
                <MdVideocam />
              </Cell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedQuestions.length ? (
              sortedQuestions.map((question, i) => (
                <TableRow
                  key={i}
                  hover
                  onClick={handleOpenQuestion(question.price)}
                  className={styles.tableRow}
                  onContextMenu={handleOpenMenu(question.price)}
                  {...row}
                >
                  <TableCell {...cell1}>{question.price}</TableCell>
                  <Cell wp={10}>
                    {question.scenario
                      ?.filter(({ type }) => type === 'text')
                      .map(({ data }) => data.text)
                      .join(', ')}
                  </Cell>
                  <Cell wp={10}>
                    {question.correctAnswers?.map((answer, i, a) => (
                      <span key={i}>
                        {answer}
                        {i !== a.length - 1 && ', '}
                      </span>
                    ))}
                    {question.incorrectAnswers?.length && ', '}
                    {question.incorrectAnswers?.map((answer, i, a) => (
                      <>
                        <span className={styles.strikethrough} key={i}>
                          {answer}
                        </span>
                        {i !== a.length - 1 && ', '}
                      </>
                    ))}
                  </Cell>
                  <Cell wp={3}>{questionType(question.type)}</Cell>
                  <Cell wp={1}>
                    {question.scenario?.some(({ type }) => type === 'image') && <MdDone />}
                  </Cell>
                  <Cell wp={1}>
                    {question.scenario?.some(({ type }) => type === 'audio') && <MdDone />}
                  </Cell>
                  <Cell wp={1}>
                    {question.scenario?.some(({ type }) => type === 'movie') && <MdDone />}
                  </Cell>
                </TableRow>
              ))
            ) : (
              <TableRow {...row}>
                <TableCell {...cell1} colSpan={7}>
                  <Typography color='text.secondary' variant='caption'>
                    Еще нет вопросов
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            <TableRow
              hover
              onClick={() => navigate(`${questionURL}/add`)}
              className={styles.addQuestionRow}
              {...row}
            >
              <TableCell colSpan={7} align='center' className={styles.addQuestionCell}>
                <MdAdd className={styles.addQuestionIcon} />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      <DeleteConfirmationDialog ref={confirmationDialogRef} />
    </>
  )
}

Cell.propTypes = { wp: PropTypes.number, children: PropTypes.node }
function Cell(props) {
  return (
    <TableCell align='right' style={{ width: (props.wp / 26) * 100 + '%' }}>
      {props.children}
    </TableCell>
  )
}

export default ItemContent
