import React from 'react'
import PropTypes from 'prop-types'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import Typography from '@mui/material/Typography'
import listStyles from './styles.module.scss'

ItemsList.propTypes = {
  droppableId: PropTypes.string,
  droppableClassName: PropTypes.string,
  draggableProps: PropTypes.object,
  list: PropTypes.array,
  itemComponent: PropTypes.func,
  useIdAsKey: PropTypes.bool,
  noItemsLabel: PropTypes.string,
  onDragEnd: PropTypes.func,
}

export default function ItemsList(props) {
  const [itemsMap, setItemsMap] = React.useState({ map: new WeakMap(), length: 0 })

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = event => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    // Find source and destination indices
    const oldIndex = props.list.findIndex(item => {
      const id = props.useIdAsKey ? item.id : getOid(item)
      return String(id) === String(active.id)
    })

    const newIndex = props.list.findIndex(item => {
      const id = props.useIdAsKey ? item.id : getOid(item)
      return String(id) === String(over.id)
    })

    if (oldIndex !== -1 && newIndex !== -1) {
      // Call the original onDragEnd with react-beautiful-dnd compatible format
      props.onDragEnd({
        source: { index: oldIndex },
        destination: { index: newIndex },
      })
    }
  }

  const getOid = object => {
    if (object._id) return object._id
    if (!itemsMap.map.has(object)) {
      setItemsMap(prev => {
        prev.map.set(object, prev.length + 1)
        return { map: prev.map, length: prev.length + 1 }
      })
    }
    return itemsMap.map.get(object) ?? itemsMap.length + 1
  }

  // Generate items array with IDs
  const items = props.list.map(item => {
    const id = props.useIdAsKey ? item.id : getOid(item)
    return String(id)
  })

  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => {}, [props.list.length])

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <div className={props.droppableClassName}>
          {props.list.length > 0 ? (
            props.list.map((item, i) => {
              const id = props.useIdAsKey ? item.id : getOid(item)

              return (
                <props.itemComponent
                  key={String(id)}
                  index={i}
                  draggableId={String(id)}
                  item={item}
                  {...props.draggableProps}
                />
              )
            })
          ) : (
            <Typography variant='body1' gutterBottom className={listStyles.noItems}>
              {props.noItemsLabel}
            </Typography>
          )}
        </div>
      </SortableContext>
    </DndContext>
  )
}
