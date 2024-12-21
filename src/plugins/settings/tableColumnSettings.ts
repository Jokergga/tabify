import { Field } from '@formily/core';
import { ISchema, useField, useFieldSchema } from '@formily/react';
import { 
  SchemaSettings, useColumnSchema, useCollectionManager_deprecated, 
  useCollection_deprecated, useDesignable, useValidateSchema, useSchemaToolbar, 
  useIsAllowToSetDefaultValue, SchemaSettingsDefaultValue,
  useFormBlockContext, useIsFormReadPretty
} from '@zebras/noco-core/client';
import { useTranslation } from 'react-i18next';
import _ from 'lodash'
import { ArrayCollapse, FormLayout } from '@formily/antd-v5';

export const tableColumnSettings = new SchemaSettings({
  name: 'fieldSettings:EditableTableColumn',
  items: [
    {
      name: 'customColumnTitle',
      type: 'modal',
      useComponentProps() {
        // const { t } = useTranslation();
        const { fieldSchema, collectionField } = useColumnSchema();
        const field: any = useField();
        const columnSchema = useFieldSchema();
        const { dn } = useDesignable();
        const options = columnSchema['x-component-props']['options'];
        const fieldOptions = field['componentProps']['options'];
        return {
          // title: t('Custom column title'),
          // title: t('Column title'),
          title: 'Column title',
          schema: {
            type: 'object',
            // title: t('Custom column title'),
            properties: {
              title: {
                // title: t('Column title'),
                default: options?.title,
                // description: `${t('Original field title: ')}${collectionField?.uiSchema?.title || fieldSchema?.title
                //   }`,
                'x-decorator': 'FormItem',
                'x-component': 'Input',
                'x-component-props': {},
              },
            },
          } as ISchema,
          onSubmit: ({ title }) => {
            if (title) {
              fieldOptions.title = title;
              options.title = title;
              dn.emit('patch', {
                schema: {
                  'x-uid': columnSchema['x-uid'],
                  title: options.title,
                },
              });
            }
            dn.refresh();
          },
        };
      },
    },
    {
      name: 'columnWidth',
      type: 'modal',
      useComponentProps() {
        const field: any = useField();
        const { t } = useTranslation();
        const columnSchema = useFieldSchema();
        const { dn } = useDesignable();
        const options = columnSchema['x-component-props']['options']
        const fieldOptions = field['componentProps']['options']
        return {
          title: t('Column width'),
          schema: {
            type: 'object',
            title: t('Column width'),
            properties: {
              width: {
                default: options['width'] || 'auto',
                'x-decorator': 'FormItem',
                'x-component': 'InputNumber',
                'x-component-props': {},
              },
            },
          } as ISchema,
          onSubmit: ({ width }) => {
            // const props = columnSchema['x-component-props'] || {};
            fieldOptions['width'] = width;
            // const schema: ISchema = {
            //   ['x-uid']: columnSchema['x-uid'],
            // };
            // schema['x-component-props'] = props;
            // columnSchema['x-component-props'] = props;
            options.width = width;
            dn.emit('patch', {
              'x-uid': columnSchema['x-uid'],
              width: options.width,
            });
            dn.refresh();
          },
        };
      },
    },
    {
      name: 'required',
      type: 'switch',
      useVisible() {
        const field = useField<Field>();
        const fieldSchema = useFieldSchema();
        const { required = true } = useSchemaToolbar();
        return !field.readPretty && fieldSchema['x-component'] !== 'FormField' && required;
      },
      useComponentProps() {
        const { t } = useTranslation();
        const field = useField<Field>();
        const fieldSchema = useFieldSchema();
        const { dn, refresh } = useDesignable();

        return {
          title: t('Required'),
          checked: fieldSchema.required as boolean,
          onChange(required) {
            const schema = {
              ['x-uid']: fieldSchema['x-uid'],
            };
            field.required = required;
            fieldSchema['required'] = required;
            schema['required'] = required;
            dn.emit('patch', {
              schema,
            });
            refresh();
          },
        };
      },
    },
    // {
    //   name: 'setDefaultValue',
    //   useVisible() {
    //     const { isAllowToSetDefaultValue } = useIsAllowToSetDefaultValue();
    //     console.log('---isAllowToSetDefaultValue---', isAllowToSetDefaultValue());
    //     // return isAllowToSetDefaultValue();
    //     return true
    //   },
    //   Component: SchemaSettingsDefaultValue,
    // },
    {
      name: 'setValidationRules',
      type: 'modal',
      useComponentProps() {
        const { t } = useTranslation();
        const field = useField<Field>();
        const fieldSchema = useFieldSchema();
        const { dn, refresh } = useDesignable();
        const validateSchema = useValidateSchema();
        const { getCollectionJoinField } = useCollectionManager_deprecated();
        const { getField } = useCollection_deprecated();
        const collectionField =
          getField(fieldSchema['name']) || getCollectionJoinField(fieldSchema['x-collection-field']);

        return {
          title: t('Set validation rules'),
          type: 'modal',
          components: { ArrayCollapse, FormLayout },
          schema: {
            type: 'object',
            title: t('Set validation rules'),
            properties: {
              rules: {
                type: 'array',
                default: fieldSchema?.['x-validator'],
                'x-component': 'ArrayCollapse',
                'x-decorator': 'FormItem',
                'x-component-props': {
                  accordion: true,
                },
                maxItems: 3,
                items: {
                  type: 'object',
                  'x-component': 'ArrayCollapse.CollapsePanel',
                  'x-component-props': {
                    header: '{{ t("Validation rule") }}',
                  },
                  properties: {
                    index: {
                      type: 'void',
                      'x-component': 'ArrayCollapse.Index',
                    },
                    layout: {
                      type: 'void',
                      'x-component': 'FormLayout',
                      'x-component-props': {
                        labelStyle: {
                          marginTop: '6px',
                        },
                        labelCol: 4,
                        wrapperCol: 20,
                      },
                      properties: {
                        ...validateSchema,
                        message: {
                          type: 'string',
                          title: '{{ t("Error message") }}',
                          'x-decorator': 'FormItem',
                          'x-component': 'Input.TextArea',
                          'x-component-props': {
                            autoSize: {
                              minRows: 2,
                              maxRows: 2,
                            },
                          },
                        },
                      },
                    },
                    remove: {
                      type: 'void',
                      'x-component': 'ArrayCollapse.Remove',
                    },
                    moveUp: {
                      type: 'void',
                      'x-component': 'ArrayCollapse.MoveUp',
                    },
                    moveDown: {
                      type: 'void',
                      'x-component': 'ArrayCollapse.MoveDown',
                    },
                  },
                },
                properties: {
                  add: {
                    type: 'void',
                    title: '{{ t("Add validation rule") }}',
                    'x-component': 'ArrayCollapse.Addition',
                    'x-reactions': {
                      dependencies: ['rules'],
                      fulfill: {
                        state: {
                          disabled: '{{$deps[0].length >= 3}}',
                        },
                      },
                    },
                  },
                },
              },
            },
          } as ISchema,
          onSubmit(v) {
            const rules = [];
            for (const rule of v.rules) {
              rules.push(_.pickBy(rule, _.identity));
            }
            const schema = {
              ['x-uid']: fieldSchema['x-uid'],
            };
            if (['percent'].includes(collectionField?.interface)) {
              for (const rule of rules) {
                if (!!rule.maxValue || !!rule.minValue) {
                  rule['percentMode'] = true;
                }

                if (rule.percentFormat) {
                  rule['percentFormats'] = true;
                }
              }
            }
            const concatValidator = _.concat([], collectionField?.uiSchema?.['x-validator'] || [], rules);
            field.validator = concatValidator;
            fieldSchema['x-validator'] = rules;
            schema['x-validator'] = rules;
            dn.emit('patch', {
              schema,
            });
            refresh();
          },
        };
      },
      useVisible() {
        const { form } = useFormBlockContext();
        const isFormReadPretty = useIsFormReadPretty();
        const validateSchema = useValidateSchema();
        console.log('---form---', form);
        console.log('---isFormReadPretty---', isFormReadPretty);
        console.log('---validateSchema---', validateSchema);
        
        // return form && !isFormReadPretty && validateSchema;
        return !isFormReadPretty && validateSchema;
      },
    },
    // {
    //   name: 'beforeMerge',
    //   type: 'modal',
    //   useComponentProps() {
    //     const { dn } = useDesignable();
    //     const field: any = useField();
    //     const columnSchema = useFieldSchema();
    //     const options = columnSchema['x-component-props']['options'];
    //     const fieldOptions = field['componentProps']['options'];
    //     return {
    //       title: '与前一列合并',
    //       schema: {
    //         type: 'object',
    //         // title: t('Custom column title'),
    //         properties: {
    //           title: {
    //             // title: t('Column title'),
    //             default: options?.title,
    //             // description: `${t('Original field title: ')}${collectionField?.uiSchema?.title || fieldSchema?.title
    //             //   }`,
    //             'x-decorator': 'FormItem',
    //             'x-component': 'Input',
    //             'x-component-props': {},
    //           },
    //         },
    //       } as ISchema,
    //       onSubmit: ({ title }) => {
    //         if (title) {
    //           fieldOptions.title = title;
    //           options.title = title;
    //           dn.emit('patch', {
    //             schema: {
    //               'x-uid': columnSchema['x-uid'],
    //               title: options.title,
    //             },
    //           });
    //         }
    //         dn.refresh();
    //       },
    //     }
    //   }
    // }
  ],
})
