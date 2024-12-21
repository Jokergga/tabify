import { ISchema } from '@formily/react';
import { uid } from '@formily/shared';

export const createEditorTablebBlockUISchema = (options: {
  dataSource: string;
  fieldNames: object;
  collectionName?: string;
  association?: string;
  rowKey?: string;
}): ISchema => {
  const { collectionName, dataSource, rowKey, association } = options;

  return {
    type: 'void',
    'x-decorator': 'TableBlockProvider',
    'x-use-decorator-props': 'useEditableTableBlockDecoratorProps',
    'x-acl-action': `${association || collectionName}:list`,
    'x-decorator-props': {
      collection: collectionName,
      association,
      dataSource,
      action: 'list',
      params: {
        pageSize: 20,
      },
      rowKey,
      showIndex: true,
      dragSort: false,
    },
    'x-toolbar': 'BlockSchemaToolbar',
    'x-settings': 'blockSettings:editableTable',
    'x-component': 'CardItem',
    properties: {
      [uid()]: {
        type: 'array',
        'x-component': 'EditableTable',
        'x-initializer': 'editableTable:configureColumns',

      },
    },
  };
};

