import { useField } from '@formily/react';
import { ListColumn } from '@visactor/react-vtable';
import React from 'react';
import { useSchemaSettingsRender } from '@zebras/noco-core/client';

export const EditableTableColumn = (props) => {
  const { render } = useSchemaSettingsRender('fieldSettings:EditableTableColumn');

  return <>
    {render()}
  </>
};


