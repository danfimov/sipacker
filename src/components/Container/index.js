import React from 'react'
import PropTypes from 'prop-types'
import { useLocation } from 'react-router'
import styles from './styles.module.scss'
import { useDispatch } from 'react-redux'
import { loadLocalPack } from '../../localStorage/localPacks'
import { loadPack } from 'store/packSlice'

Container.propTypes = {
  children: PropTypes.node,
}

function Container(props) {
  const dispatch = useDispatch()
  const route = useLocation()

  const routeChanged = React.useCallback(
    async pathParts => {
      if (pathParts[0] === 'pack') {
        const packUUID = pathParts[1]
        const pack = await loadLocalPack(packUUID)
        dispatch(loadPack(pack ?? 'notFound'))
      }
    },
    [dispatch]
  )

  React.useEffect(() => {
    routeChanged(route.pathname.split('/').filter(String))
  }, [route, routeChanged])

  return <div className={styles.container}>{props.children}</div>
}

export default Container
