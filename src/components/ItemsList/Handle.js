import PropTypes from 'prop-types'
import styles from './styles.module.scss'
import { MdDragHandle } from 'react-icons/md'

Handle.propTypes = { provided: PropTypes.object, className: PropTypes.string }
export default function Handle(props) {
  return (
    <div
      className={[styles.handle, props.className].filter(Boolean).join(' ')}
      {...props.provided.dragHandleProps}
    >
      <MdDragHandle />
    </div>
  )
}
