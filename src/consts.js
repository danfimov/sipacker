import PropTypes from 'prop-types'

export const componentsPropTypes = {
  pack: PropTypes.shape({
    uuid: PropTypes.string,
    name: PropTypes.string,
    creationTime: PropTypes.number,
    date: PropTypes.string,
    thumbnail: PropTypes.string,
  }),
}

export const format = {
  xmlVersion: '1.0',
  encoding: 'utf-8',
  latestVersion: 4,
}

export const uuidRegex = '\\b[0-9a-f]{8}\\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\\b[0-9a-f]{12}\\b'
