import React from 'react'
import { Link, useLocation } from 'react-router'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Typography from '@mui/material/Typography'
import styles from '../styles.module.scss'
import { useSelector } from 'react-redux'
import { componentsPropTypes, uuidRegex } from 'consts'
import pathRegexps from '../pathRegexps.json'
const { settings, rounds, question } = pathRegexps

PackBreadcrumbs.propTypes = {
  pack: componentsPropTypes.pack,
}

function PackBreadcrumbs() {
  const pack = useSelector(state => state.pack)
  const linkStyles = [styles.link, 'onHover', 'noDefaults'].join(' ')
  const route = useLocation()
  const [path, setPath] = React.useState([])

  React.useEffect(() => {
    const page = route.pathname.split(new RegExp(`/pack/${uuidRegex}`), 2)[1]
    const parts = page.split('/')

    const crumbs = {
      dashboard: { to: '/', name: 'Паки' },
      currentPack: { to: `/pack/${pack.uuid}`, name: pack.name },
      settings: { to: `/pack/${pack.uuid}/settings`, name: 'Настройки' },
      rounds: { to: `/pack/${pack.uuid}/rounds/${parts[2]}`, name: `Раунд ${parts[2]}` },
      theme: { name: `Тема ${parts[4]}` },
      questions: {
        to: `/pack/${pack.uuid}/rounds/${parts[2]}/themes/${parts[4]}/questions/${parts[6]}`,
        name: parts[6] === 'add' ? 'Новый вопрос' : `Вопрос за ${parts[6]}`,
      },
    }

    const paths = {
      default: [crumbs.dashboard, crumbs.currentPack],
      [settings]: [crumbs.dashboard, crumbs.currentPack, crumbs.settings],
      [rounds]: [crumbs.dashboard, crumbs.currentPack, crumbs.rounds],
      [question]: [
        crumbs.dashboard,
        crumbs.currentPack,
        crumbs.rounds,
        crumbs.theme,
        crumbs.questions,
      ],
    }

    for (let [pathRegex, path] of Object.entries(paths)) {
      if (new RegExp(`^${pathRegex}/?$`).test(page)) {
        return setPath(path)
      }
    }
    return setPath(paths.default)
  }, [route, pack])

  return (
    <Breadcrumbs>
      {path.map(({ to, name }, i) => {
        if (to && i !== path.length - 1) {
          return (
            <Link to={to} className={linkStyles} key={i}>
              {name}
            </Link>
          )
        } else {
          return (
            <Typography color={i === path.length - 1 ? 'text.primary' : 'text.secondary'} key={i}>
              {name}
            </Typography>
          )
        }
      })}
    </Breadcrumbs>
  )
}

export default PackBreadcrumbs
