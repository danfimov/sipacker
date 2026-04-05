import React from 'react'
import PropTypes from 'prop-types'
import styles from './styles.module.scss'
import ItemContent from './Questions'
import Item from 'components/ItemsList/Item'
import { MdDelete, MdExpandMore } from 'react-icons/md'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import TextField from '@mui/material/TextField'
import ClickIsolator from 'components/ClickIsolator'
import Handle from 'components/ItemsList/Handle'
import DeleteConfirmationDialog from 'components/ConfirmationDialog/DeleteConfirmationDialog'

Theme.propTypes = {
  item: PropTypes.object,
  index: PropTypes.number,
  expandId: PropTypes.string,
  setExpand: PropTypes.func,
  draggableId: PropTypes.string,
  handleRemoveTheme: PropTypes.func,
  handleChangeThemeName: PropTypes.func,
}

function Theme(props) {
  const theme = props.item
  const expand = props.draggableId === props.expandId
  const [themeName, setThemeName] = React.useState(theme.name)
  const confDialogRef = React.useRef()

  const handleDelete = e => {
    e.stopPropagation()
    confDialogRef.current
      .confirmThemeDeletion()
      .then(confirmed => confirmed && props.handleRemoveTheme(props.index))
  }

  const handleChangeThemeName = e => {
    const newThemeName = e.target.value
    setThemeName(newThemeName)
    props.handleChangeThemeName(props.index, newThemeName)
  }

  return (
    <>
      <Item index={props.index} draggableId={props.draggableId.toString()}>
        {provided => (
          <Accordion
            expanded={expand}
            onChange={(_, isExpand) => props.setExpand(isExpand ? props.draggableId : undefined)}
          >
            <AccordionSummary expandIcon={<MdExpandMore />}>
              <div className={styles.toolbar}>
                <Handle provided={provided} />
                <ClickIsolator className={styles.name}>
                  <TextField
                    value={themeName}
                    label='Название темы'
                    variant='outlined'
                    onChange={handleChangeThemeName}
                    size='small'
                    fullWidth
                  />
                </ClickIsolator>
                <ClickIsolator>
                  <div
                    role='button'
                    aria-label='Удалить тему'
                    tabIndex={0}
                    onClick={handleDelete}
                    onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleDelete(e)}
                    className={styles.deleteBtn}
                  >
                    <MdDelete />
                  </div>
                </ClickIsolator>
              </div>
            </AccordionSummary>
            <AccordionDetails>
              <ItemContent theme={theme} themeIndex={props.index} />
            </AccordionDetails>
          </Accordion>
        )}
      </Item>
      <DeleteConfirmationDialog ref={confDialogRef} />
    </>
  )
}

export { Theme as ThemeComponent }
export default Theme
