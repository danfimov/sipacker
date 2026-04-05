import React from 'react'
import PropTypes from 'prop-types'
import ConfirmationDialog from 'components/ConfirmationDialog'
import { deleteFilesOfPack, getAllURIsFromPack } from 'localStorage/fileStorage'
import { deleteLocalPack, saveLocalPack } from 'localStorage/localPacks'
import { useNavigate } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import { loadPack } from 'store/packSlice'
import { fileUnlinked } from 'store/fileRenderingSlice'

const DeleteConfirmationDialog = React.forwardRef((props, ref) => {
  const confirmationDialogRef = React.useRef()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const pack = useSelector(state => state.pack)

  React.useImperativeHandle(ref, () => ({
    async confirmPackDeletion(packUUID) {
      const { confirmed, checked } = await confirmationDialogRef.current.open(
        'Вы уверены, что хотите удалить пак? Он будет удален безвозвратно.',
        'Удалить',
        'Удалить все связанные медиафайлы'
      )
      const deleteFiles = checked
      if (confirmed) {
        if (deleteFiles) {
          const fileURIs = await getAllURIsFromPack(packUUID)
          fileURIs.forEach(fileURI => dispatch(fileUnlinked({ fileURI })))
          await deleteFilesOfPack(packUUID)
        }
        await deleteLocalPack(packUUID)
        navigate('/')
      }
      return confirmed
    },

    async confirmRoundDeletion() {
      const { confirmed } = await confirmationDialogRef.current.open(
        'Вы уверены, что хотите удалить раунд? Все вопросы и темы также будут удалены безвозвратно.',
        'Удалить'
      )
      return confirmed
    },

    async confirmThemeDeletion() {
      const { confirmed } = await confirmationDialogRef.current.open(
        'Вы уверены, что хотите удалить тему? Все вопросы также будут удалены безвозвратно.',
        'Удалить'
      )
      return confirmed
    },

    async confirmDeleteQuestion(round, themeIndex, questionPrice) {
      const { confirmed } = await confirmationDialogRef.current.open(
        'Вы уверены, что хотите удалить вопрос безвозвратно?',
        'Удалить'
      )
      if (!confirmed) return false

      const price = parseInt(questionPrice)
      const rounds = pack.rounds.map((r, ri) => {
        if (ri !== round) return r
        return {
          ...r,
          themes: r.themes.map((t, ti) => {
            if (ti !== themeIndex) return t
            return {
              ...t,
              questions: t.questions
                .filter(q => q.price !== price)
                .sort((a, b) => a.price - b.price),
            }
          }),
        }
      })
      const currentPack = { ...pack, rounds }
      await saveLocalPack(currentPack)
      dispatch(loadPack(currentPack))
      return true
    },
  }))

  return <ConfirmationDialog ref={confirmationDialogRef} />
})

DeleteConfirmationDialog.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
}

DeleteConfirmationDialog.displayName = 'DeleteConfirmationDialog'
export default DeleteConfirmationDialog
