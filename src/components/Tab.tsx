import { useSortable } from '@dnd-kit/sortable';
import React from 'react';
import { CSS } from '@dnd-kit/utilities';

const Tab = (props) => {

  const { label, onClick, isActive } = props;

  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: props['node-key'],
  });

  const style: React.CSSProperties = {
    ...props.style,
    transform: CSS.Translate.toString(transform),
    transition,
    cursor: 'move',
  };


  return (
    <button
      onClick={onClick}
      style={{
        padding: '10px',
        margin: '0 5px',
        border: isActive ? '2px solid blue' : '1px solid gray',
        backgroundColor: isActive ? 'lightblue' : 'white',
        ...style,
      }}
      ref={setNodeRef}
      {...attributes}
      {...listeners}
    >
      {label}
    </button>
  );
};

export default Tab;
