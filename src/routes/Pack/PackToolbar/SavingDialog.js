import React from 'react'
import styles from './styles.module.scss'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import MuiDialog from '@mui/material/Dialog'
import LinearProgress from '@mui/material/LinearProgress'
import Zoom from '@mui/material/Zoom'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import { generate, check } from 'localStorage/packGenerator'
import { saveAs } from 'file-saver'
import { slugify } from 'transliteration'

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Zoom ref={ref} {...props} />
})

const SavingDialog = React.forwardRef((props, ref) => {
  const [open, setOpen] = React.useState(false)
  const [generating, setGenerating] = React.useState(false)
  const [errors, setErrors] = React.useState([])
  const [warnings, setWarnings] = React.useState([])

  const bundlePack = async pack => {
    let zip,
      warnings = []
    try {
      const result = await generate(pack)
      zip = result.result
      warnings = result.warnings
    } catch (e) {
      console.error(e)
      return setErrors([e?.message])
    }
    setGenerating(false)
    saveAs(zip, `${slugify(pack.name) || '_'}.siq`, { autoBom: true })
    setWarnings(warnings)
    setOpen(warnings.length > 0)
  }

  const startProcessing = async pack => {
    const errors = await check(pack)
    setErrors(errors)
    if (errors.length) return

    setGenerating(true)
    setTimeout(() => bundlePack(pack), 500)
  }

  React.useImperativeHandle(ref, () => ({
    save(pack) {
      setOpen(true)
      startProcessing(pack)
    },
  }))

  return (
    <MuiDialog
      maxWidth='xs'
      open={open}
      TransitionComponent={Transition}
      onClose={() => errors.length && setOpen(false)}
    >
      <DialogTitle>Генерация архива</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {generating && Boolean(!errors.length) && (
            <>
              <span style={{ display: 'block', marginBottom: 8 }}>
                Производится генерация файла пака. Это может занять несколько секунд, в зависимости
                от количества медиа-файлов.
              </span>
              <LinearProgress color='primary' />
            </>
          )}
          {Boolean(errors.length) && (
            <>
              <span style={{ display: 'block' }}>
                Исправьте следующие ошибки и перезапустите процесс генерации пака:
              </span>
              <ul>
                {errors.map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
              </ul>
            </>
          )}
          {Boolean(warnings.length) && (
            <>
              <span style={{ display: 'block' }}>
                Во время генерации возникли возникли следующие предупреждения, их не требуется
                исправлять:
              </span>
              <ul>
                {warnings.map((warning, i) => (
                  <li key={i} className={styles.warnings}>
                    {warning}
                  </li>
                ))}
              </ul>
            </>
          )}
        </DialogContentText>
      </DialogContent>
      {!generating && (
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Закрыть</Button>
        </DialogActions>
      )}
    </MuiDialog>
  )
})

SavingDialog.displayName = 'ConfirmationDialog'
export default SavingDialog
