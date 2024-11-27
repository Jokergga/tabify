import React, { useState } from 'react';
import Tab from './Tab';
import type { DragEndEvent } from '@dnd-kit/core';
import { DndContext, PointerSensor, closestCenter, useSensor } from '@dnd-kit/core';
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
} from '@dnd-kit/sortable';


const TabGroup = ({ tabs }) => {
  const [active, setActive] = useState(tabs[0].key);
  const [items, setItems] = React.useState(tabs);

  const sensor = useSensor(PointerSensor, { activationConstraint: { distance: 10 } });

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (active.id !== over?.id) {
      setItems((prev) => {
        const activeIndex = prev.findIndex((i) => i.key === active.id);
        const overIndex = prev.findIndex((i) => i.key === over?.id);
        return arrayMove(prev, activeIndex, overIndex);
      });
    }
  };

  const content = React.useMemo(() => {
    return tabs.find(item => item.key === active).content
  }, [active])

  return (
    <DndContext sensors={[sensor]} onDragEnd={onDragEnd} collisionDetection={closestCenter}>
      <div style={{ display: 'flex', marginBottom: '10px' }}>
        <SortableContext items={items.map((i) => i.key)} strategy={horizontalListSortingStrategy}>
          {items.map((item, index) => (
            <Tab
              key={item.key}
              node-key={item.key}
              label={item.label}
              isActive={active === item.key}
              onClick={() => setActive(item.key)}
            />
          ))}
        </SortableContext>
      </div>
      <div>
        {content}
      </div>
    </DndContext>

  );
};

export default TabGroup;
