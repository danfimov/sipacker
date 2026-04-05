import PropTypes from 'prop-types'
import styles from './styles.module.scss'
import PackBreadcrumbs from './PackBreadcrumbs/'
import { useSelector } from 'react-redux'
import { componentsPropTypes } from '../../consts'
import PackToolbar from './PackToolbar/'
import Rounds from './Rounds'
import Settings from './Settings/'
import { Routes, Route } from 'react-router'
import RoundThemes from './RoundThemes'
import NotFound404 from 'components/NotFound404'
import Question from './Question'

PackPageContainer.propTypes = {
  children: PropTypes.node,
  pack: componentsPropTypes.pack,
  toolbar: PropTypes.string,
}

export const questionPath = '/rounds/:roundIndex/themes/:themeIndex/questions/:questionPrice'

function PackPageContainer() {
  const pack = useSelector(state => state.pack)

  return (
    pack &&
    (pack === 'notFound' ? (
      <NotFound404 />
    ) : (
      <div className={styles.container}>
        <div className={styles.toolbar}>
          <PackBreadcrumbs />
          <PackToolbar />
        </div>
        <Routes>
          <Route index element={<Rounds />} />
          <Route path='settings' element={<Settings />} />
          <Route path={questionPath} element={<Question />} />
          <Route path='rounds/:roundIndex' element={<RoundThemes />} />
          <Route path='*' element={<NotFound404 />} />
        </Routes>
      </div>
    ))
  )
}

export default PackPageContainer
