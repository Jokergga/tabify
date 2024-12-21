import { useField, useFieldSchema } from '@formily/react';
import { 
  SchemaSettings, SchemaSettingsBlockTitleItem, useTableBlockContext, useDesignable,
  SchemaSettingsLinkageRules, useCollection_deprecated
} from '@zebras/noco-core/client';
import { useTranslation } from 'react-i18next';


export const tableBlockSettings = new SchemaSettings({
  name: 'blockSettings:editableTable',
  items: [
    {
      name: 'editBlockTitle',
      Component: SchemaSettingsBlockTitleItem,
    },
    // {
    //   name: 'ConnectDataBlocks',
    //   Component: SchemaSettingsConnectDataBlocks,
    //   useComponentProps() {
    //     const { t } = useTranslation();
    //     return {
    //       type: FilterBlockType.TABLE,
    //       emptyDescription: t('No blocks to connect'),
    //     };
    //   },
    // },
    {
      name: 'RecordsPerPage',
      type: 'select',
      useComponentProps() {
        const field = useField();
        const fieldSchema = useFieldSchema();
        const { service } = useTableBlockContext();
        const { t } = useTranslation();
        const { dn } = useDesignable();

        return {
          title: t('Records per page'),
          value: field.decoratorProps?.params?.pageSize || 20,
          options: [
            { label: '10', value: 10 },
            { label: '20', value: 20 },
            { label: '50', value: 50 },
            { label: '100', value: 100 },
            { label: '200', value: 200 },
          ],
          onChange: (pageSize) => {
            const params = field.decoratorProps.params || {};
            params.pageSize = pageSize;
            field.decoratorProps.params = params;
            fieldSchema['x-decorator-props']['params'] = params;
            service.run({ ...service.params?.[0], pageSize, page: 1 });
            dn.emit('patch', {
              schema: {
                ['x-uid']: fieldSchema['x-uid'],
                'x-decorator-props': fieldSchema['x-decorator-props'],
              },
            });
          },
        };
      },
    },

    {
      name: 'linkageRules',
      Component: SchemaSettingsLinkageRules,
      useComponentProps() {
        const { name } = useCollection_deprecated();
        return {
          collectionName: name,
        };
      },
    },
  ],
})