import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import { useDispatch, useSelector } from 'react-redux'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import { setPosition } from 'store/menuSlice'

export const ContextMenuActions = React.createContext({})
function ContextMenu(props) {
  const [items, setItems] = React.useState()
  const dispatch = useDispatch()
  const menu = useSelector(state => state.menu)

  const contextMenu = {
    open(e, items) {
      if (menu?.position) return true
      else e.preventDefault()
      setItems(items)
      dispatch(setPosition([e.clientX, e.clientY]))
      return false
    },
  }

  const close = e => {
    e?.preventDefault()
    dispatch(setPosition(null))
  }

  const handleSelect = action => e => {
    e.stopPropagation()
    action()
    close()
  }

  return (
    <>
      <ContextMenuActions.Provider value={contextMenu}>
        {props.children}
      </ContextMenuActions.Provider>
      {ReactDOM.createPortal(
        <Menu
          open={!!menu?.position}
          anchorReference='anchorPosition'
          anchorPosition={menu?.position && { top: menu.position[1], left: menu.position[0] }}
          onClose={close}
        >
          {items?.map((item, i) => (
            <MenuItem onClick={handleSelect(item.action)} key={i}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText>{item.name}</ListItemText>
            </MenuItem>
          ))}
        </Menu>,
        document.body
      )}
    </>
  )
}

ContextMenu.displayName = 'ContextMenu'
ContextMenu.propTypes = {
  name: PropTypes.string,
  children: PropTypes.node,
}

export default ContextMenu
