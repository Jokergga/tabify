import React from 'react';
import { useSchemaSettingsRender } from '@zebras/noco-core/client';
import { useFieldSchema } from '@formily/react';

export const EditableTableColumn = (props) => {
  const { render } = useSchemaSettingsRender('fieldSettings:EditableTableColumn');
  const fieldSchema = useFieldSchema();

  return <>
    {render()}
  </>
};


