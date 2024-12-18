import { useField } from '@formily/react';
import React from 'react';

export const EditableTableColumnDecorator = (props) => {
  // const Designer = useDesigner();
  console.log('---EditableTableColumnDecorator props--', props);
  const field = useField();
  return props.children
};


