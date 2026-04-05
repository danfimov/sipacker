import PropTypes from 'prop-types'
import styles from './styles.module.scss'
import TableContainer from '@mui/material/TableContainer'
import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableBody from '@mui/material/TableBody'
import Paper from '@mui/material/Paper'
import ButtonBase from '@mui/material/ButtonBase'
import { useParams, Link } from 'react-router'
import Typography from '@mui/material/Typography'
import { MdAdd } from 'react-icons/md'

RoundTable.propTypes = { themes: PropTypes.array }
export default function RoundTable(props) {
  const params = useParams()
  const url = `/pack/${params.packUUID}/rounds/${params.roundIndex}`

  return (
    <TableContainer component={Paper} className={styles.table}>
      <Table>
        <TableBody>
          {props.themes.map((row, i) => (
            <TableRow key={i} sx={{ '&:last-child td, &:last-child th': { borderBottom: 0 } }}>
              <TableCell component='th' scope='row' className={styles.rowName}>
                {row.name}
              </TableCell>
              {row.questions.map((question, j) => (
                <TableCell key={j} className={styles.tableCell}>
                  <Link to={`${url}/themes/${i + 1}/questions/${question.price}`}>
                    <ButtonBase className={styles.buttonBase}>{question.price}</ButtonBase>
                  </Link>
                </TableCell>
              ))}
              {!row.questions.length && (
                <TableCell>
                  <Typography color='text.secondary' variant='caption'>
                    Еще нет вопросов
                  </Typography>
                </TableCell>
              )}
              <TableCell className={`${styles.tableCell} ${styles.addCell}`}>
                <Link to={`${url}/themes/${i + 1}/questions/add`}>
                  <ButtonBase className={styles.buttonBase}>
                    <MdAdd />
                  </ButtonBase>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
