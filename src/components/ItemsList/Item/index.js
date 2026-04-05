import PropTypes from 'prop-types'
import { useSortable } from '@dnd-kit/sortable'
import Card from '@mui/material/Card'
import styles from './styles.module.scss'

Item.propTypes = {
  index: PropTypes.number,
  draggableId: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.func,
  tag: PropTypes.string,
}

export default function Item(props) {
  const { listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: props.draggableId,
  })

  const style = {
    transform: transform ? `translate(0px, ${transform.y}px)` : undefined,
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  // Create a 'provided' object similar to react-beautiful-dnd for backward compatibility
  const provided = {
    innerRef: setNodeRef,
    draggableProps: {
      style,
    },
    dragHandleProps: listeners,
  }

  return (
    <Card className={[props.className, styles.item].join(' ')} ref={setNodeRef} style={style}>
      {props.children(provided)}
    </Card>
  )
}
