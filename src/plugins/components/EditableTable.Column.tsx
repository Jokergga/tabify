import { useField } from '@formily/react';
import { ListColumn } from '@visactor/react-vtable';
import React from 'react';

export const EditableTableColumn = (props) => {

  console.log('---EditableTableColumn props--', props.options);
  
  return <ListColumn key={props.field} {...props.options} />
};


