import React from "react";
import { withDynamicSchemaProps, useSchemaInitializerRender, useACLFieldWhitelist, useDesignable, useApp } from '@zebras/noco-core/client';
import * as ReactVTable from '@visactor/react-vtable';
import { DateInputEditor, InputEditor, ListEditor, TextAreaEditor } from '@visactor/vtable-editors';
import { Pagination, type PaginationProps } from 'antd';
import { createStyles } from 'antd-style';
import {  Schema, useField, useFieldSchema } from "@formily/react";
import { EditableTableColumn } from "./EditableTable.Column";
import { EditableTableColumnDecorator } from "./EditableTable.Column.Decorator";
import { arrayToTree, findDataByColumns, findElementWithParents, getMaxDepth, isColumnComponent } from "../utils";
import { ArrayField } from "@formily/core";
import { ListTableProps } from "@visactor/react-vtable/es/tables/list-table";
import ReactDom from 'react-dom/client'
import { IVTable } from "@visactor/react-vtable/es/tables/base-table";
import { uid } from '@formily/shared';
import { SettingsRender } from "../settings";

const { register, ListTable, ListColumn } = ReactVTable;

const inputEditor = new InputEditor();
const textAreaEditor = new TextAreaEditor();
const dateInputEditor = new DateInputEditor();
const listEditor = new ListEditor({ values: ['女', '男'] });

register.editor('text-editor', inputEditor);
register.editor('textArea-editor', textAreaEditor);
register.editor('date-editor', dateInputEditor);
register.editor('list-editor', listEditor);

const records = new Array(10).fill({ 'f_0pdrve0ap0': 'test-data', });


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
  const field = useArrayField(props);
  const tableInstance = React.useRef(null);
  const { styles } = useStyles();
  const schema = useFieldSchema();
  const { dn } = useDesignable();
  const { exists: tableInitializerExists, render: tableInitializerRender } = useSchemaInitializerRender(schema['x-initializer'], schema['x-initializer-props']);
  const { schemaInWhitelist } = useACLFieldWhitelist();
  const columnsSchema = schema.reduceProperties((buf, s) => {
    if (isColumnComponent(s) && schemaInWhitelist(Object.values(s.properties || {}).pop())) {
      return buf.concat([s]);
    }
    return buf;
  }, []);
  const colsRef = React.useRef<any>();
  const columns = React.useMemo(() => {
    const cols = columnsSchema.map(item => ({ id: item['x-uid'], ...item['x-component-props']['options'], name: item['name'], }));
    console.log('col array', JSON.parse(JSON.stringify(cols)));
    colsRef.current = [...cols];
    const res = arrayToTree(cols)
    console.log('col tree', res);
    return res
  }, [columnsSchema])
  // const [columns, setColumns] = React.useState(initialColumns)

  const setColumns = (columns) => {
    console.log('---setColumns---', columns);
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
        // const maxDepth = getMaxDepth(columns);
        if (row < 4) {
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

  const onReady = (instance: IVTable, isInitial: boolean) => {
    if (isInitial) {
      tableInstance.current = instance;
      instance.on('dropdown_menu_click', (args) => {
        console.log('dropdown_menu_click', args);
        const { menuKey, col, field, row, cellLocation } = args;
        // console.log('---columns---', JSON.parse(JSON.stringify(columns)));
        // const data = findDataByColumns(args, columns);
        const cols = [...colsRef.current]
        const data = findElementWithParents(cols, field)
        console.log('---cols--', cols);
        console.log('---data--', data);
        const id = uid();
        switch (menuKey) {
          case 'beforeMerge':
            // first level
            if (data.length === 1) {
              const element = data[0];
              // cols.splice(element.index - 1, 2, { title: 'test-merge', columns: [columns[element.index - 1], columns[element.index]], })
              cols.splice(element.index - 1, 2, ...[{ ...columns[element.index - 1], parent: id }, { ...columns[element.index], parent: id }, { title: 'test-merge', id }]);
            }
            for (let index = data.length - 2; index >= 0; index--) {
              const element = data[index].data;
              const next = data[index + 1].index;
              if (next > 0) {
                // element.columns.splice(next - 1, 2, { title: 'test-merge', columns: [element.columns[next - 1], element.columns[next]], });
                element.columns.splice(next - 1, 2, ...[{ ...element.columns[next - 1], parent: id }, { ...element.columns[next], parent: id }, { title: 'test-merge', id }]);
                break;
              }
              // bubbling to first level
              if (index === 0) {
                console.log(data[index].index);
                const eIndex = data[index].index
                // cols.splice(eIndex - 1, 2, { title: 'test-merge', columns: [columns[eIndex - 1], columns[eIndex]], })
                cols.splice(eIndex - 1, 2, ...[{ ...columns[eIndex - 1], parent: id }, { ...columns[eIndex], parent: id }, { title: 'test-merge', id }])
              }
            }
            break;
          case 'afterMerge':
            // first level
            if (data.length === 1) {
              const element = data[0];
              // cols.splice(element.index, 2, { title: 'test-merge', columns: [columns[element.index], columns[element.index + 1]], })
              cols.splice(element.index, 2, ...[{ ...columns[element.index], parent: id }, { ...columns[element.index + 1], parent: id }, { title: 'test-merge', id }])
            }
            for (let index = data.length - 2; index >= 0; index--) {
              const element = data[index].data;
              const next = data[index + 1].index;
              if (next < element.columns.length) {
                // element.columns.splice(next, 2, { title: 'test-merge', columns: [element.columns[next], element.columns[next + 1]], });
                element.columns.splice(next, 2, ...[{ ...element.columns[next], parent: id }, { ...element.columns[next + 1], parent: id }, { title: 'test-merge', id }]);
                break;
              }
              // bubbling to first level
              if (index === 0) {
                console.log(data[index].index);
                const eIndex = data[index].index
                // cols.splice(eIndex - 1, 2, { title: 'test-merge', columns: [columns[eIndex], columns[eIndex + 1]], })
                cols.splice(eIndex - 1, 2, ...[{ ...columns[eIndex], parent: id }, { ...columns[next + 1], parent: id }, { title: 'test-merge', id }])
              }
            }
            break;
          default:
            break;
        }
        setColumns([...cols])
      })
      instance.on('change_header_position', (args) => {
      })
      instance.on('click_cell', (args) => {
        console.log('___click_cell___', args);
        let file = colsRef.current.find(item => item.field === args.field)
        if ((args.title !== file.title) && file.parent) {
          file = colsRef.current.find(item => item.id === file.parent)
        }
        app.emit("attribute:operator", { uid: file["id"] });
      })
    }
  }
  const onClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
  }

  return <div onClick={onClick} style={{ width: '100%', height: '100%' }}>
    <ListTable {...options} style={{ zIndex: 11 }} onReady={onReady} ReactDOM={ReactDom}>
      {
        columns.map(s => <ListColumn key={s.field} {...s} />)
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
