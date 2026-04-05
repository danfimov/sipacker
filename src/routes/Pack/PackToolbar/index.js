import React from 'react'
import { useLocation, useNavigate, Link } from 'react-router'
import styles from './styles.module.scss'
import { useSelector } from 'react-redux'
import { componentsPropTypes } from '../../../consts'
import IconButton from '@mui/material/IconButton'
import { MdSettings, MdDelete, MdFileDownload } from 'react-icons/md'
import { saveLocalPack } from 'localStorage/localPacks'
import DeleteConfirmationDialog from 'components/ConfirmationDialog/DeleteConfirmationDialog'
import SavingDialog from './SavingDialog'
import pathRegexps from '../pathRegexps.json'
const { root, rounds, questionNoAdd } = pathRegexps
import { uuidRegex } from 'consts'

PackToolbar.propTypes = {
  pack: componentsPropTypes.pack,
}

function PackToolbar() {
  const pack = useSelector(state => state.pack)
  const confirmationDialogRef = React.useRef()
  const savingDialogRef = React.useRef()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const handleSave = () => savingDialogRef.current.save(pack)
  const handleDeletePack = () => {
    confirmationDialogRef.current.confirmPackDeletion(pack.uuid)
  }

  const handleDeleteRound = async () => {
    if (!(await confirmationDialogRef.current.confirmRoundDeletion())) return
    const updatedPack = { ...pack }
    const roundIndex = parseInt(pathname.split(`/pack/${pack.uuid}/rounds/`, 2)[1])
    updatedPack.rounds.splice(roundIndex - 1, 1)
    await saveLocalPack(updatedPack)
    navigate(`/pack/${updatedPack.uuid}`)
  }

  const handleDeleteQuestion = async () => {
    let [, round, themeIndex, questionPrice] = pathname.match(
      new RegExp(`/pack/${uuidRegex}/rounds/(\\d+)/themes/(\\d+)/questions/(\\d+)`)
    )
    round -= 1
    themeIndex -= 1
    await confirmationDialogRef.current.confirmDeleteQuestion(round, themeIndex, questionPrice)
    navigate(`/pack/${pack.uuid}/rounds/${round + 1}`)
  }

  const buttons = pack && {
    [root]: [
      [handleSave, <MdFileDownload key='download' />],
      [`/pack/${pack.uuid}/settings`, <MdSettings key='settings' />],
      [handleDeletePack, <MdDelete key='delete' />, styles.delete],
    ],
    [rounds]: [[handleDeleteRound, <MdDelete key='delete' />, styles.delete]],
    [questionNoAdd]: [[handleDeleteQuestion, <MdDelete key='delete' />, styles.delete]],
  }

  const path = pathname.split(`/pack/${pack.uuid}`, 2)[1]
  // eslint-disable-next-line react-hooks/refs
  const pageToolbar = Object.entries(buttons).find(
    ([regex, toolbar]) => new RegExp(`^${regex}/?$`).test(path) && toolbar
  )

  return (
    <>
      <div className={styles.buttons}>
        {pageToolbar &&
          pageToolbar[1].map(([action, icon, styles], i) => (
            <React.Fragment key={i}>
              {typeof action === 'string' ? (
                <Link to={action} className={styles}>
                  <IconButton>{icon}</IconButton>
                </Link>
              ) : (
                <IconButton className={styles} onClick={action}>
                  {icon}
                </IconButton>
              )}
            </React.Fragment>
          ))}
      </div>
      <DeleteConfirmationDialog ref={confirmationDialogRef} />
      <SavingDialog ref={savingDialogRef} />
    </>
  )
}

export default PackToolbar
