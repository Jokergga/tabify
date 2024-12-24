import React from "react";
import { useVariables, useLocalVariables, withDynamicSchemaProps, SchemaComponentOptions, SchemaComponent, useSchemaInitializerRender, useACLFieldWhitelist, useDesignable, useApp } from '@zebras/noco-core/client';
import * as ReactVTable from '@visactor/react-vtable';
import { DateInputEditor, InputEditor, ListEditor, TextAreaEditor } from '@visactor/vtable-editors';
import { Pagination, type PaginationProps } from 'antd';
import { createStyles } from 'antd-style';
import { Schema, SchemaOptionsContext, useField, useFieldSchema } from "@formily/react";
import { EditableTableColumn } from "./EditableTable.Column";
import { EditableTableColumnDecorator } from "./EditableTable.Column.Decorator";
import { arrayToTree, findDataByColumns, findElementWithParents, getMaxDepth, isColumnComponent } from "../utils";
import { ArrayField } from "@formily/core";
import { ListTableProps } from "@visactor/react-vtable/es/tables/list-table";
import ReactDom from 'react-dom/client'
import { IVTable } from "@visactor/react-vtable/es/tables/base-table";
import { uid } from '@formily/shared';
import { SettingsRender } from "../settings";
import { useTranslation } from "react-i18next";
import { FormLayout, FormDialog } from "@formily/antd-v5";
import TextEditor from "../editor-components/Text";
import { useLinkageRules } from "../context/LinkageRulesContext";
import { collectFieldStateOfLinkageRules, getFieldNameByOperator, getTempFieldState } from "../utils/linkage";
import { conditionAnalyses } from "../utils/linkage_condition";
const { register, ListTable, ListColumn } = ReactVTable;

// const inputEditor = new InputEditor();
const textAreaEditor = new TextAreaEditor();
const dateInputEditor = new DateInputEditor();
const listEditor = new ListEditor({ values: ['女', '男'] });

// register.editor('text-editor', inputEditor);
register.editor('textArea-editor', textAreaEditor);
register.editor('date-editor', dateInputEditor);
register.editor('list-editor', listEditor);

const records = new Array(10).fill({ 'f_0pdrve0ap0': 'test-data', 'f_pyo4cdyqgj': 3 });


const useStyles = createStyles(({ css }) => {
  return {
    'table-container': css`
      z-index: 11;
      height: 100%;
     `,
    'page-container': css`
      padding: 10px 0 0 0;
      display: flex;
      justify-content: flex-end;
      z-index: 11;
     `,
  }
})

const useArrayField = (props) => {
  const field = useField<ArrayField>();
  return (props.field || field) as ArrayField;
};

const EditableTable = withDynamicSchemaProps((props) => {
  const app = useApp();
  // const field = useArrayField(props);
  const tableInstance = React.useRef(null);
  const { styles } = useStyles();
  const schema = useFieldSchema();
  const { dn } = useDesignable();
  const { t } = useTranslation();
  const { exists: tableInitializerExists, render: tableInitializerRender } = useSchemaInitializerRender(schema['x-initializer'], schema['x-initializer-props']);
  const { schemaInWhitelist } = useACLFieldWhitelist();
  const variables = useVariables();
  // const localVariables = useLocalVariables({ currentForm: form });
  const localVariables = useLocalVariables();

  const { linkageRules } = useLinkageRules();
  const schemaOptions = React.useContext(SchemaOptionsContext);
  const columnsSchema = schema.reduceProperties((buf, s) => {
    if (isColumnComponent(s) && schemaInWhitelist(Object.values(s.properties || {}).pop())) {
      return buf.concat([s]);
    }
    return buf;
  }, []);
  const colsRef = React.useRef<any>();
  const columns = React.useMemo(() => {
    const cols = columnsSchema.map(item => ({
      id: item['x-uid'],
      ...item['x-component-props']['options'],
      name: item['name'],
      validator: item['x-validator'],
    }));
    colsRef.current = JSON.parse(JSON.stringify(cols));
    const res = arrayToTree(cols);
    return res
  }, [columnsSchema])
  // const [columns, setColumns] = React.useState(initialColumns)

  const setColumns = (columns) => {
    columns.forEach(col => {
      if (col.name) {
        schema.properties![col.name]['x-component-props'] = { options: col }
      } else {
        const id = uid()
        schema.properties![id] = new Schema({
          name: id,
          'x-uid': col.id,
          ['x-component-props']: { options: col },
          type: 'void',
          'x-component': 'EditableTable.Column',
        })
      }

    })
    dn.refresh()
  }

  const onPageChange: PaginationProps['onChange'] = (pageNumber) => {
    console.log('Page: ', pageNumber);
  }

  const options: ListTableProps = {
    // columns,
    records,
    // 宽度
    autoFillWidth: true,
    // 序号
    rowSeriesNumber: {
      title: '序号',
      width: 'auto',
      headerStyle: {
        color: 'black',
        bgColor: 'pink'
      },
      style: {
        color: 'red'
      }
    },
    // 分页
    pagination: {
      currentPage: 0,
      perPageCount: 100
    },
    // 换位置
    dragHeaderMode: 'column',
    menu: {
      contextMenuItems(field, row, col, table,) {
        const maxDepth = getMaxDepth(columns);
        if (row === 0) {
          return [
            { text: '与前一列合并', menuKey: 'beforeMerge', },
            { text: '与后一列合并', menuKey: 'afterMerge', }
            // { text: '', menuKey: 'afterMerge', }
          ]
        }
        return [
          { text: "向下插入空行", menuKey: 'insertDown' },
          { text: "向上插入空行", menuKey: 'insertUp' },
          { text: '修改值', menuKey: 'update' },
          { text: '删除该行', menuKey: 'remove' },
        ]
      },
    },

  };

  const changeCellValue = (args) => {
    const record = tableInstance.current!.getRecordByCell(args.col, args.row);
    const fieldValue = tableInstance.current!.getHeaderField(args.col, args.row);
    const recordIndex = tableInstance.current!.getRecordShowIndexByCell(args.col, args.row);
    // console.log('---field---', field);
    console.log('---linkageRules---', linkageRules);
    linkageRules.forEach((rule) => {
      // console.log('---rule---', rule);
      // conditionAnalyses({ ruleGroup: rule.condition, variables, localVariables: [{ name: "$nForm", ctx: record }] }).then((result) => {
      //   console.log('---result---', result);
      // });

      rule.actions?.forEach((action) => {
        // if (action.targetFields?.length) {
        //   if (action.targetFields.includes(field)) {
        //   }
        // }
        const field = { value: fieldValue };
        field['initStateOfLinkageRules'] = {
          // display: field.initStateOfLinkageRules?.display || getTempFieldState(true, field.display),
          // required: field.initStateOfLinkageRules?.required || getTempFieldState(true, field.required || false),
          // pattern: field.initStateOfLinkageRules?.pattern || getTempFieldState(true, field.pattern),
          value: getTempFieldState(true, record[fieldValue]),
        };
        collectFieldStateOfLinkageRules({
          operator: action.operator,
          value: action.value,
          field,
          condition: rule.condition,
          variables,
          localVariables: [{ name: "$nForm", ctx: record }] ,
        });

        // 当条件改变时，有可能会触发多个 reaction，所以这里需要延迟一下，确保所有的 reaction 都执行完毕后，
        // 再从 field.stateOfLinkageRules 中取值，因为此时 field.stateOfLinkageRules 中的值才是全的。
        setTimeout(async () => {
          const fieldName = getFieldNameByOperator(action.operator);
          // console.log('---fieldName---', fieldName);
          // console.log('---field---', field);
          // 防止重复赋值
          if (!field.stateOfLinkageRules?.[fieldName]) {
            return;
          }
          let stateList = field.stateOfLinkageRules[fieldName];
          stateList = await Promise.all(stateList);
          console.log('---stateList---', stateList);
          stateList = stateList.filter((v) => v.condition);
          const lastState = stateList[stateList.length - 1];

          if (fieldName === 'value') {
            // value 比较特殊，它只有在匹配条件时才需要赋值，当条件不匹配时，维持现在的值；
            // stateList 中肯定会有一个初始值，所以当 stateList.length > 1 时，就说明有匹配条件的情况；
            if (stateList.length > 1) {
              // field.value = lastState.value;
              action.targetFields?.forEach((targetField) => {
                // tableInstance.current!.updateRecords([{ [targetField]: field[fieldName] }], [args.row]);
                tableInstance.current!.updateRecords([{ ...record, [targetField]: lastState.value }], [recordIndex]);
              });
            }
          } else {
            field[fieldName] = lastState?.value;
            //字段隐藏时清空数据
            if (fieldName === 'display' && lastState?.value === 'none') {
              field.value = null;
            }
          }
         

          console.log('---field---', field);
          // 在这里清空 field.stateOfLinkageRules，就可以保证：当条件再次改变时，如果该字段没有和任何条件匹配，则需要把对应的值恢复到初始值；
          // field.stateOfLinkageRules[fieldName] = null;
        });
      });
    });
  }


  const onReady = async (instance: IVTable, isInitial: boolean) => {
    if (isInitial) {
      tableInstance.current = instance;
      instance.on('dropdown_menu_click', async (args) => {
        console.log('dropdown_menu_click', args);
        const { menuKey, col, field, row, cellLocation } = args;
        // const data = findDataByColumns(args, columns);
        const cols = [...colsRef.current]
        const data = findElementWithParents(columns, field)
        const id = uid();
        switch (menuKey) {
          case 'beforeMerge':
            // first level
            // if (data.length === 1) {
            const element = data[0];
            const updateColumns = [columns[element.index - 1], columns[element.index]];
            updateColumns.forEach(item => {
              cols.find(col => col.id === item.id).parent = id;
            })
            // cols.splice(element.index - 1, 2, { title: 'test-merge', columns: [columns[element.index - 1], columns[element.index]], })
            // cols.splice(element.index - 1, 2, ...[{ ...cols[element.index - 1], parent: id }, { ...cols[element.index], parent: id }, { title: 'test-merge', id }]);
            // }
            // for (let index = data.length - 2; index >= 0; index--) {
            //   const element = data[index].data;
            //   const next = data[index + 1].index;
            //   if (next > 0) {
            //     // element.columns.splice(next - 1, 2, { title: 'test-merge', columns: [element.columns[next - 1], element.columns[next]], });
            //     element.columns.splice(next - 1, 2, ...[{ ...element.columns[next - 1], parent: id }, { ...element.columns[next], parent: id }, { title: 'test-merge', id }]);
            //     break;
            //   }
            //   // bubbling to first level
            //   if (index === 0) {
            //     console.log(data[index].index);
            //     const eIndex = data[index].index
            //     // cols.splice(eIndex - 1, 2, { title: 'test-merge', columns: [columns[eIndex - 1], columns[eIndex]], })
            //     cols.splice(eIndex - 1, 2, ...[{ ...columns[eIndex - 1], parent: id }, { ...columns[eIndex], parent: id }, { title: 'test-merge', id }])
            //   }
            // }
            const { title } = await FormDialog(
              // "编辑分组名称",
              t("configure component properties"),
              () => {
                return (
                  <SchemaComponentOptions scope={schemaOptions!.scope} components={{ ...schemaOptions!.components }}>
                    <FormLayout layout={'vertical'}>
                      <SchemaComponent
                        schema={{
                          type: 'object',
                          properties: {
                            title: {
                              title: '分组名称',
                              type: 'string',
                              'x-decorator': 'FormItem',
                              'x-component': 'Input',
                              'required': 'true',
                            }
                          },
                        }}
                      />
                    </FormLayout>
                  </SchemaComponentOptions>
                )
              }
            ).open({
            });
            setColumns([...cols, { title, id }]);
            break;
          case 'afterMerge':
            // first level
            // if (data.length === 1) {
            const element1 = data[0];
            const updateColumns1 = [columns[element1.index], columns[element1.index + 1]];
            updateColumns1.forEach(item => {
              cols.find(col => col.id === item.id).parent = id;
            });
            // cols.splice(element.index, 2, { title: 'test-merge', columns: [columns[element.index], columns[element.index + 1]], })
            // cols.splice(element.index, 2, ...[{ ...columns[element.index], parent: id }, { ...columns[element.index + 1], parent: id }, { title: 'test-merge', id }])
            // }
            // for (let index = data.length - 2; index >= 0; index--) {
            //   const element = data[index].data;
            //   const next = data[index + 1].index;
            //   if (next < element.columns.length) {
            //     // element.columns.splice(next, 2, { title: 'test-merge', columns: [element.columns[next], element.columns[next + 1]], });
            //     element.columns.splice(next, 2, ...[{ ...element.columns[next], parent: id }, { ...element.columns[next + 1], parent: id }, { title: 'test-merge', id }]);
            //     break;
            //   }
            //   // bubbling to first level
            //   if (index === 0) {
            //     console.log(data[index].index);
            //     const eIndex = data[index].index
            //     // cols.splice(eIndex - 1, 2, { title: 'test-merge', columns: [columns[eIndex], columns[eIndex + 1]], })
            //     cols.splice(eIndex - 1, 2, ...[{ ...columns[eIndex], parent: id }, { ...columns[next + 1], parent: id }, { title: 'test-merge', id }])
            //   }
            // }
            const { title1 } = await FormDialog(
              "编辑分组名称",
              () => {
                return (
                  <SchemaComponentOptions scope={schemaOptions!.scope} components={{ ...schemaOptions!.components }}>
                    <FormLayout layout={'vertical'}>
                      <SchemaComponent
                        schema={{
                          type: 'object',
                          properties: {
                            title1: {
                              title: '分组名称',
                              type: 'string',
                              'x-decorator': 'FormItem',
                              'x-component': 'Input',
                              'required': 'true',
                            }
                          },
                        }}
                      />
                    </FormLayout>
                  </SchemaComponentOptions>
                )
              }
            ).open({});
            setColumns([...cols, { title: title1, id }]);
            break;
          default:
            break;
        }
      })
      instance.on('change_header_position', (args) => {
      })
      instance.on('click_cell', (args) => {
        console.log('___click_cell___', args);
        let file = colsRef.current.find(item => item.field === args.field)
        // TODO: 递归查找父级
        if ((args.title !== file.title) && file.parent) {
          file = colsRef.current.find(item => item.id === file.parent)
        }
        app.emit("attribute:operator", { uid: file["id"] });
      });

      // 编辑单元格数据
      instance.on('change_cell_value', changeCellValue);
    }
  }
  const onClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
  }

  return <div onClick={onClick} style={{ width: '100%', height: '100%' }}>
    <ListTable {...options} style={{ zIndex: 11 }} onReady={onReady} ReactDOM={ReactDom}>
      {
        columns.map(s => {
          const editor = new TextEditor({ validator: s.validator });
          const props = {
            key: s.field,
            field: s.field,
            title: s.title,
            width: s.width,
            editor,
          };
          return <ListColumn {...props} />
        })
      }
    </ListTable>
    <SettingsRender />
    <div className={styles['page-container']} >
      {tableInitializerExists && tableInitializerRender()}
    </div>
  </div>
}, {
  displayName: 'editableTable'
});

EditableTable.Column = EditableTableColumn;

EditableTable.Column.Decorator = EditableTableColumnDecorator;

export default EditableTable;
