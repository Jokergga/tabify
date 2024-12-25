import { Schema, useFieldSchema, useForm } from '@formily/react';
// import { CompatibleSchemaInitializer, useCollection, useCollectionManager, useTableColumnInitializerFields } from '@zebras/noco-core/client'
import { CompatibleSchemaInitializer, useCollection, useCollectionManager, useCollection_deprecated, useCollectionManager_deprecated } from '@zebras/noco-core/client'


const findTableColumn = (schema: Schema, key: string, action: string, deepth = 0) => {
  return schema.reduceProperties((buf, s) => {
    if (s[key] === action) {
      return s;
    }
    const c = s.reduceProperties((buf, s) => {
      if (s[key] === action) {
        return s;
      }
      return buf;
    });
    if (c) {
      return c;
    }
    return buf;
  });
};

export const removeTableColumn = (schema, cb) => {
  cb(schema.parent);
};

const useTableColumnInitializerFields = () => {
  const { name, currentFields = [] } = useCollection_deprecated();
  const { getInterface, getCollection } = useCollectionManager_deprecated();
  const fieldSchema = useFieldSchema();
  const isSubTable = fieldSchema['x-component'] === 'AssociationField.SubTable';
  const form = useForm();
  const isReadPretty = isSubTable ? form.readPretty : true;
  return currentFields
    .filter((field) => field?.interface && field?.interface !== 'subTable' && !field?.treeChildren)
    .map((field) => {
      const interfaceConfig = getInterface(field.interface);
      const isFileCollection = field?.target && getCollection(field?.target)?.template === 'file';
      const isPreviewComponent = field?.uiSchema?.['x-component'] === 'Preview';
      console.log('---field.uiSchema---', field.uiSchema);
      
      const schema = {
        name: field.name,
        'x-collection-field': `${name}.${field.name}`,
        'x-component': 'CollectionField',
        // 'x-component-props': isFileCollection
        //   ? {
        //       fieldNames: {
        //         label: 'preview',
        //         value: 'id',
        //       },
        //     }
        //   : isPreviewComponent
        //     ? { size: 'small' }
        //     : {},
        'x-component-props': {
          title: field.uiSchema.title,
          field: field.name,
          width: 'auto',
          // TODO: set editor
          editor: field.uiSchema['x-component'],
          enums: field.uiSchema['enum'],
        },
        'x-read-pretty': isReadPretty || field.uiSchema?.['x-read-pretty'],
        // 'x-decorator': isSubTable
        //   ? quickEditField.includes(field.interface) || isFileCollection
        //     ? 'QuickEdit'
        //     : 'FormItem'
        //   : null,
        'x-decorator-props': {
          labelStyle: {
            display: 'none',
          },
        },
      };
      interfaceConfig?.schemaInitialize?.(schema, { field, readPretty: true, block: 'Table' });
      return {
        type: 'item',
        name: field.name,
        title: field?.uiSchema?.title || field.name,
        Component: 'TableCollectionFieldInitializer',
        find: findTableColumn,
        remove: removeTableColumn,
        schemaInitialize: (s) => {
          interfaceConfig?.schemaInitialize?.(s, {
            field,
            readPretty: isReadPretty,
            block: 'Table',
            targetCollection: getCollection(field.target),
          });
        },
        field,
        schema,
      };
    });
}

const commonOptions = {
  insertPosition: 'beforeEnd',
  // icon: 'SettingOutlined',
  icon: 'PlusCircleOutlined',
  title: '{{t("Configure columns")}}',
  wrap: (s, { isInSubTable }) => {
    // if (s['x-action-column']) {
    //   return s;
    // }
    return {
      type: 'void',
      // 'x-decorator': 'EditableTable.Column.Decorator',
      'x-component': 'EditableTable.Column',
      'x-component-props': {options: s['x-component-props']},
      // 'x-toolbar': 'TableColumnSchemaToolbar',
      // 'x-settings': 'fieldSettings:TableColumn',
      properties: {
        [s.name]: {
          ...s,
        },
      },
    };
  },
  items: [
    {
      name: 'displayFields',
      type: 'itemGroup',
      title: '{{t("Display fields")}}',
      // children: DisplayFields,
      useChildren: useTableColumnInitializerFields,
    },
    // {
    //   name: 'parentCollectionFields',
    //   Component: ParentCollectionFields,
    // },
    // {
    //   name: 'associationFields',
    //   Component: AssociatedFields,
    // },
    {
      name: 'divider',
      type: 'divider',
      useVisible() {
        const fieldSchema = useFieldSchema();
        return fieldSchema['x-component'] !== 'AssociationField.SubTable';
      },
    },
    {
      type: 'item',
      name: 'add',
      title: '{{t("Action column")}}',
      Component: 'TableActionColumnInitializer',
      useVisible() {
        const fieldSchema = useFieldSchema();
        return fieldSchema['x-component'] !== 'AssociationField.SubTable';
      },
    },
  ],
};

export const editableTableColumnInitializers = new CompatibleSchemaInitializer(
  {
    name: 'editableTable:configureColumns',
    ...commonOptions,
  },
);
