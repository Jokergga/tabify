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
import { conditionAnalyses, getTargetField } from "../utils/linkage_condition";
import { DateEditor, SelectEditor } from "../editor-components";
import AntdSelectEditor from "../editor-components/AntdSelect";
import AntdDatePickerEditor from "../editor-components/AntdDatePicker";
import AntdTextAreaEditor from "../editor-components/TextArea";
import { FilterDropdown } from "./FilterDropdown";
const { register, ListTable, ListColumn } = ReactVTable;

// const inputEditor = new InputEditor();
// const textAreaEditor = new TextAreaEditor();
// const dateInputEditor = new DateInputEditor();
// const listEditor = new ListEditor({ values: ['女', '男'] });
// register.editor('text-editor', inputEditor);
// register.editor('textArea-editor', textAreaEditor);
// register.editor('date-editor', dateInputEditor);
// register.editor('list-editor', listEditor);

register.icon('filter', {
  name: 'filter',
  type: 'svg',
  width: 20,
  height: 20,
  marginRight: 6,
  positionType: 'right',
  // interactive: true,
  svg: '<svg t="1707378931406" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1587" width="10" height="10"><path d="M909.6 854.5L649.9 594.8C690.2 542.7 712 479 712 412c0-80.2-31.3-155.4-87.9-212.1-56.6-56.7-132-87.9-212.1-87.9s-155.5 31.3-212.1 87.9C143.2 256.5 112 331.8 112 412c0 80.1 31.3 155.5 87.9 212.1C256.5 680.8 331.8 712 412 712c67 0 130.6-21.8 182.7-62l259.7 259.6a8.2 8.2 0 0011.6 0l43.6-43.5a8.2 8.2 0 000-11.6zM570.4 570.4C528 612.7 471.8 636 412 636s-116-23.3-158.4-65.6C211.3 528 188 471.8 188 412s23.3-116.1 65.6-158.4C296 211.3 352.2 188 412 188s116.1 23.2 158.4 65.6S636 352.2 636 412s-23.3 116.1-65.6 158.4z" p-id="1588"></path></svg>'
});

const records = new Array(10).fill(1).map(item => ({ 'f_0pdrve0ap0': uid(), 'f_pyo4cdyqgj': uid(), "f_g9r5ogfqve": '2024-02-15', "f_co8bk2r1dr": 'item1' }));


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
    const cols = columnsSchema.map(item => {
      const options = item['x-component-props']['options'];
      const filter = item['x-component-props']['filter'];
      const sorter = item['x-component-props']['sorter'];
      let editor;
      if (["DatePicker"].includes(options.editor)) {
        // editor = new DateEditor({});
        editor = new AntdDatePickerEditor({});
      } else if (["Select"].includes(options.editor)) {
        // editor = new SelectEditor({enums: options.enums});
        editor = new AntdSelectEditor({ enums: options.enums });
      } else if (["Input.TextArea"].includes(options.editor)) {
        // editor = new TextAreaEditor({});
        editor = new AntdTextAreaEditor({});
      }
      else {
        editor = new TextEditor({ validator: item['x-validator'] });
      }
      return {
        id: item['x-uid'],
        ...item['x-component-props']['options'],
        name: item['name'],
        editor,
        fieldFormat(v) {
          if (options.enums?.length) {
            return options.enums.find(item => item.value === v[options.field]).label
          }
          return v[options.field];
        },
        sort: Boolean(sorter),
        headerIcon: filter ? 'filter' : undefined,
      }
    });
    colsRef.current = JSON.parse(JSON.stringify(cols));
    const res = arrayToTree(cols);
    return res
  }, [columnsSchema])

  const setColumns = (columns) => {
    const properties = schema.properties || {};
    const newProperties = {};
    columns.forEach(col => {
      if (col.name) {
        properties![col.name]['x-component-props'] = { options: col }
        newProperties[col.name] = properties![col.name]
      } else {
        const id = uid()
        newProperties[id] = new Schema({
          name: id,
          'x-uid': col.id,
          ['x-component-props']: { options: col },
          type: 'void',
          'x-component': 'EditableTable.Column',
        })
      }
    })
    schema.properties = newProperties;
    dn.refresh();
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
      contextMenuItems(field, row, col, table, ...args) {
        const maxDepth = getMaxDepth(columns);
        if (row === 0) {
          return [
            col > 1 && { text: '与前一列合并', menuKey: 'beforeMerge', },
            col > 0 && col < colsRef.current.length - 1 && { text: '与后一列合并', menuKey: 'afterMerge', }
          ].filter(Boolean);
        }

        if (row < maxDepth) {
          return [
            { text: '取消合并', menuKey: 'cancelMerge' },
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
    hover: {
      highlightMode: 'cross'
    },
  };

  const onChangeCellValue = (args) => {
    const record = tableInstance.current!.getRecordByCell(args.col, args.row);
    const fieldValue = tableInstance.current!.getHeaderField(args.col, args.row);
    const recordIndex = tableInstance.current!.getRecordShowIndexByCell(args.col, args.row);
    linkageRules.forEach((rule) => {
      const paths = getTargetField(rule.condition);
      if (!paths.includes(fieldValue)) return;
      rule.actions?.forEach((action) => {
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
          localVariables: [{ name: "$nForm", ctx: record }],
        });

        // 当条件改变时，有可能会触发多个 reaction，所以这里需要延迟一下，确保所有的 reaction 都执行完毕后，
        // 再从 field.stateOfLinkageRules 中取值，因为此时 field.stateOfLinkageRules 中的值才是全的。
        setTimeout(async () => {
          const fieldName = getFieldNameByOperator(action.operator);
          // 防止重复赋值
          if (!field.stateOfLinkageRules?.[fieldName]) {
            return;
          }
          let stateList = field.stateOfLinkageRules[fieldName];
          stateList = await Promise.all(stateList);
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
          // 在这里清空 field.stateOfLinkageRules，就可以保证：当条件再次改变时，如果该字段没有和任何条件匹配，则需要把对应的值恢复到初始值；
          // field.stateOfLinkageRules[fieldName] = null;
        });
      });
    });
  }

  const onDropdownMenuClick = async (args) => {
    console.log('dropdown_menu_click', args);
    const { menuKey, col, field, row, cellLocation } = args;
    const recordIndex = tableInstance.current.getRecordShowIndexByCell(col, row);
    const cols = [...colsRef.current];
    // console.log('---columns---', columns);
    const columns = arrayToTree(cols);
    const data = findElementWithParents(columns, field);
    console.log('---data---', data);
    const id = uid();
    switch (menuKey) {
      // ----------merge------------
      case 'beforeMerge':
        const element = data[0];
        const updateColumns = [columns[element.index - 1], columns[element.index]];
        updateColumns.forEach(item => {
          cols.find(col => col.id === item.id).parent = id;
        })
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
        const element1 = data[0];
        const updateColumns1 = [columns[element1.index], columns[element1.index + 1]];
        updateColumns1.forEach(item => {
          cols.find(col => col.id === item.id).parent = id;
        });
        const { title1 } = await FormDialog(
          "编辑分组名称",
          () => <SchemaComponentOptions scope={schemaOptions!.scope} components={{ ...schemaOptions!.components }}>
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
        ).open({});
        setColumns([...cols, { title: title1, id }]);
        break;
      // ----------cancel merge------------
      case 'cancelMerge':
        // const lastElement = data[data.length - 1];
        const parent = data[data.length - 2].data;
        const index = colsRef.current.findIndex(col => col.id === parent.id);
        colsRef.current.filter(col => col.parent === parent.id).forEach(child => {
          child.parent = parent.parent;
        });
        setColumns([...colsRef.current.slice(0, index), ...colsRef.current.slice(index + 1)])
        break;
      // ----------data operate------------
      case 'insertDown':
        tableInstance.current.addRecord({}, recordIndex + 1);
        tableInstance.current.startEditCell(1, row + 1);
        break;
      case 'insertUp':
        tableInstance.current.addRecord({}, recordIndex - 1);
        tableInstance.current.startEditCell(1, row - 1);
        break;
      case 'update':
        tableInstance.current.startEditCell(col, row);
        break;
      case 'remove':
        tableInstance.current.deleteRecords([recordIndex]);
        break;
      default:
        break;
    }
  };

  const onClickCell = (args) => {
    console.log('___click_cell___', args);
    let file = colsRef.current.find(item => item.field === args.field)
    // TODO: 递归查找父级
    if ((args.title !== file.title) && file.parent) {
      file = colsRef.current.find(item => item.id === file.parent)
    }
    app.emit("attribute:operator", { uid: file["id"] });
  }

  const onChangeHeaderPosition = (args) => {
  }

  const onResizeColumn = (args) => {
    // console.log('resize_column_end', args);
  }

  // let filterContainer = tableInstance.current.getElement();
  let select;

  let filterListSelectedValues = '';
  let lastFilterField;

  const onIconClick = (args) => {
    const { col, row, name } = args;
    if (name === 'filter') {
      const field = tableInstance.current.getHeaderField(col, row);
      if (select && lastFilterField === field) {
        removeFilterElement();
        lastFilterField = null;
      } else if (!select || lastFilterField !== field) {
        const rect = tableInstance.current.getCellRelativeRect(col, row);
        // createFilterElement(filterListValues[field], filterListSelectedValues, field, rect);
        createFilterElement(['item1', 'item2', 'item3'], filterListSelectedValues, field, rect);
        lastFilterField = field;
      }
    }
  }

  function createFilterElement(values, curValue, field, positonRect) {
    const tableInstanceElement = tableInstance.current.getElement();
    // create select tag
    // select = document.createElement('select');
    // select.setAttribute('type', 'text');
    // select.style.position = 'absolute';
    // select.style.padding = '4px';
    // select.style.width = '100%';
    // select.style.boxSizing = 'border-box';
    select = document.createElement('div');

    const root = ReactDom.createRoot(select);

    const style = {
      position: 'absolute',
      padding: '4px',
      boxSizing: 'border-box',
      top: positonRect.top + positonRect.height + 'px',
      left: positonRect.left + 'px',
      height: positonRect.height + 'px',
      width: positonRect.width + 'px',
    }

    root.render(
      <div>
        <FilterDropdown style={style} />
      </div>
    );

    tableInstanceElement.appendChild(select);

    // // create option tags
    // let opsStr = '';
    // values.forEach(item => {
    //   opsStr +=
    //     item === curValue
    //       ? `<option value="${item}" selected>${item}</option>`
    //       : `<option value="${item}" >${item}</option>`;
    // });
    // select.innerHTML = opsStr;
    // tableInstance.current.getElement().appendChild(select);
    // select.style.top = positonRect.top + positonRect.height + 'px';
    // select.style.left = positonRect.left + 'px';
    // select.style.width = positonRect.width + 'px';
    // select.style.height = positonRect.height + 'px';

    select.addEventListener('change', () => {
      filterListSelectedValues = select.value;
      tableInstance.current.updateFilterRules([
        {
          filterKey: field,
          filteredValues: select.value
        }
      ]);
      removeFilterElement();
      //更新列头icon
      columns.forEach(col => {
        if (col.field === field) {
          col.headerIcon = 'filter';
        }
      });
      tableInstance.current.updateColumns(columns);
    });

  }

  function removeFilterElement() {
    tableInstance.current.getElement().removeChild(select);
    select.removeEventListener('change', () => {
      // this.successCallback();
    });
    select = null;
  }


  const onReady = async (instance: IVTable, isInitial: boolean) => {
    if (isInitial) {
      tableInstance.current = instance;
      instance.on('dropdown_menu_click', onDropdownMenuClick);
      instance.on('change_header_position', onChangeHeaderPosition);
      instance.on('click_cell', onClickCell);
      instance.on('change_cell_value', onChangeCellValue);
      instance.on('resize_column_end', onResizeColumn);
      instance.on('icon_click', onIconClick);
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
          const props = {
            key: s.field,
            // editor: s.editor,
            // field: s.field,
            // title: s.title,
            // width: s.width,
            // columns: s.columns,
            // fieldFormat: s.fieldFormat,
            // sort: s.sort,
            ...s,
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
