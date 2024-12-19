import React from "react";
import { withDynamicSchemaProps, useSchemaInitializerRender, useACLFieldWhitelist } from '@zebras/noco-core/client';
import * as ReactVTable from '@visactor/react-vtable';
import { DateInputEditor, InputEditor, ListEditor, TextAreaEditor } from '@visactor/vtable-editors';
import { Pagination, type PaginationProps } from 'antd';
import { createStyles } from 'antd-style';
import { RecursionField, useField, useFieldSchema } from "@formily/react";
import { EditableTableColumn } from "./EditableTable.Column";
import { EditableTableColumnDecorator } from "./EditableTable.Column.Decorator";
import { findDataByColumns, findElementWithParents, getMaxDepth, isColumnComponent } from "../utils";
import { ArrayField } from "@formily/core";
import { ListTableProps } from "@visactor/react-vtable/es/tables/list-table";
import ReactDom from 'react-dom/client'
import { IVTable } from "@visactor/react-vtable/es/tables/base-table";
import { uid } from '@formily/shared';

const { register, ListTable, ListColumn, Group, Text, Image } = ReactVTable;

const inputEditor = new InputEditor();
const textAreaEditor = new TextAreaEditor();
const dateInputEditor = new DateInputEditor();
const listEditor = new ListEditor({ values: ['女', '男'] });

register.editor('text-editor', inputEditor);
register.editor('textArea-editor', textAreaEditor);
register.editor('date-editor', dateInputEditor);
register.editor('list-editor', listEditor);

function generateRandomBirthday() {
  const start = new Date('1970-01-01');
  const end = new Date('2000-12-31');
  const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  const year = randomDate.getFullYear();
  const month = randomDate.getMonth() + 1;
  const day = randomDate.getDate();
  return `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`;
}

const records = new Array(1000).fill({ 'f_0pdrve0ap0': '2134', name: 'John', age: 18, gender: 'male', birthday: generateRandomBirthday(), hobby: '🏀' });

const initialColumns = [
  {
    field: 'name',
    title: 'name',
    editor: 'text-editor',
    width: 'auto',
  },
  {
    field: 'age',
    title: 'age',
    editor: 'text-editor',
    width: 'auto',
  },
  {
    field: 'gender',
    title: 'gender',
    editor: 'list-editor',
    width: 'auto',
  },
  {
    field: 'birthday',
    title: 'birthday',
    editor: 'date-editor',
    width: 'auto',
  },
  {
    field: 'hobby',
    title: 'hobby',
    editor: 'textArea-editor',
    width: 'auto',
  },
];

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
const TempCom = (props) => {
  return <UserProfileComponent {...props} />
}

const UserProfileComponent = props => {
  const { table, row, col, rect, dataValue } = props;
  if (!table || row === undefined || col === undefined) {
    return null;
  }
  const { height, width } = rect || table.getCellRect(col, row);
  // const record = table.getRecordByCell(col, row);
  return (
    <Group
      attribute={{
        width,
        height,
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'nowrap',
        alignItems: 'center',
        alignContent: 'center'
      }}
      onClick={() => { console.log('gggggggggggggggg') }}
    >
      {/* <Group
        attribute={{
          width: 190,
          height: 25,
          fill: '#e6fffb',
          lineWidth: 1,
          cornerRadius: 10,
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'nowrap',
          alignItems: 'center',
          alignContent: 'center',
          cursor: 'pointer',
          boundsPadding: [0, 0, 0, 10],
          react: {
            pointerEvents: true,
            container: table.headerDomContainer, // table.headerDomContainer
            // container: table.bodyDomContainer, // table.headerDomContainer
            anchorType: 'bottom-right',
            element: <CardInfo  record={record} hover={hover} row={row} />
          }
        }}
        onMouseEnter={event => {
          setHover(true);
          event.currentTarget.stage.renderNextFrame(); // to do: auto execute in react-vtable
        }}
        onMouseLeave={event => {
          setHover(false);
          event.currentTarget.stage.renderNextFrame();
        }}
      > */}
      <Text
        attribute={{
          text: dataValue,
          fontSize: 14,
          fontFamily: 'sans-serif',
          fill: 'rgb(51, 101, 238)',
          // boundsPadding: [0, 0, 0, 10],
          // cursor: 'pointer'
        }}
      />
      {/* </Group> */}
    </Group>
  );
};

const CardInfo = props => {
  // const { bloggerName, bloggerAvatar, introduction, city } = props.record;
  return <h1 onClick={() => { console.log('card click'); }}>123</h1>
  // return props.hover ? (
  //   <Card
  //     className="card-with-icon-hover"
  //     style={{ width: 360 }}
  //     cover={
  //       <div style={{ height: '100px', overflow: 'hidden' }}>
  //         <img
  //           style={{ width: '100%', transform: 'translateY(-20px)' }}
  //           alt="dessert"
  //           // eslint-disable-next-line max-len
  //           src={bloggerAvatar}
  //         />
  //       </div>
  //     }
  //     // actions={[
  //     //   <span className="icon-hover" key={0}>
  //     //     <IconThumbUp />
  //     //   </span>,
  //     //   <span className="icon-hover" key={1}>
  //     //     <IconShareInternal />
  //     //   </span>,
  //     //   <span className="icon-hover" key={2}>
  //     //     <IconMore />
  //     //   </span>
  //     // ]}
  //   >
  //     <Meta
  //       avatar={
  //         <Space>
  //           <Avatar size={24}>{city.slice(0, 1)}</Avatar>
  //           <Typography.Text>{city}</Typography.Text>
  //         </Space>
  //       }
  //       title={bloggerName}
  //       description={introduction}
  //     />
  //   </Card>
  // ) : (
  //   <></>
  // );
};

const EditableTable = withDynamicSchemaProps((props) => {
  const tableInstance = React.useRef(null);
  const { styles } = useStyles();
  const schema = useFieldSchema();
  const field = useArrayField(props);
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
   console.log('---columnsSchema---', columnsSchema);
   const cols = columnsSchema.map(item => item['x-component-props']['options']);
   console.log('--cols--', cols);
   colsRef.current = cols;
   return cols
  }, [columnsSchema])
  // const [columns, setColumns] = React.useState(initialColumns)

  const setColumns = (columns) => {
    console.log('---setColumns---', columns);
    console.log(schema.properties, '123');
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

    // customRender(args) {
    //   if (args.row === 0 || args.col === 0) return null;
    //   const { width, height } = args.rect;
    //   const { dataValue, table, row, col } = args;
    //   const elements: any[] = [];
    //   let top = 30;
    //   const left = 15;
    //   let maxWidth = 0;
    //   elements.push({
    //     type: 'rect',
    //     fill: '#a23be1',
    //     x: left + 20,
    //     y: top - 20,
    //     width: 300,
    //     height: 28
    //   });
    //   elements.push({
    //     type: 'text',
    //     fill: 'white',
    //     fontSize: 20,
    //     fontWeight: 500,
    //     textBaseline: 'middle',
    //     text:
    //       col === 1
    //         ? row === 1
    //           ? 'important & urgency'
    //           : 'not important but urgency'
    //         : row === 1
    //         ? 'important but not urgency'
    //         : 'not important & not urgency',
    //     x: left + 50,
    //     y: top - 5
    //   });
    //   // dataValue.forEach((item, i) => {
    //   //   top += 35;
    //   //   if (col == 1) {
    //   //     if (row === 1)
    //   //       elements.push({
    //   //         type: 'icon',
    //   //         svg: '<svg t="1687586728544" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1480" width="200" height="200"><path d="M576.4 203.3c46.7 90.9 118.6 145.5 215.7 163.9 97.1 18.4 111.5 64.9 43.3 139.5s-95.6 162.9-82.3 265.2c13.2 102.3-24.6 131-113.4 86.2s-177.7-44.8-266.6 0-126.6 16-113.4-86.2c13.2-102.3-14.2-190.7-82.4-265.2-68.2-74.6-53.7-121.1 43.3-139.5 97.1-18.4 169-73 215.7-163.9 46.6-90.9 93.4-90.9 140.1 0z" fill="#733FF1" p-id="1481"></path></svg>',
    //   //         x: left - 6,
    //   //         y: top - 6,
    //   //         width: 12,
    //   //         height: 12
    //   //       });
    //   //     else
    //   //       elements.push({
    //   //         type: 'circle',
    //   //         stroke: '#000',
    //   //         fill: 'yellow',
    //   //         x: left,
    //   //         y: top,
    //   //         radius: 3
    //   //       });
    //   //   } else {
    //   //     elements.push({
    //   //       type: 'rect',
    //   //       stroke: '#000',
    //   //       fill: 'blue',
    //   //       x: left - 3,
    //   //       y: top - 3,
    //   //       width: 6,
    //   //       height: 6
    //   //     });
    //   //   }
    //   //   elements.push({
    //   //     type: 'text',
    //   //     fill: 'blue',
    //   //     font: '14px sans-serif',
    //   //     baseline: 'top',
    //   //     text: item,
    //   //     x: left + 10,
    //   //     y: top + 5
    //   //   });
    //   //   maxWidth = Math.max(maxWidth, table.measureText(item, { fontSize: '15' }).width);
    //   // });
    //   return {
    //     elements,
    //     expectedHeight: top + 20,
    //     expectedWidth: maxWidth + 20
    //   };
    // }
  };

  const onReady = (instance: IVTable, isInitial: boolean) => {
    if (isInitial) {
      tableInstance.current = instance;
      instance.on('dropdown_menu_click', (args) => {
        console.log('dropdown_menu_click', args);
        const { menuKey, col, field, row, cellLocation } = args;
        
        console.log('col：', col, 'row：', row, 'field：', field);
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
              cols.splice(element.index - 1, 2, ...[{...columns[element.index - 1], parent: id}, {...columns[element.index], parent: id}, { title: 'test-merge', id }]);
            }
            for (let index = data.length - 2; index >= 0; index--) {
              const element = data[index].data;
              const next = data[index + 1].index;
              if (next > 0) {
                // element.columns.splice(next - 1, 2, { title: 'test-merge', columns: [element.columns[next - 1], element.columns[next]], });
                element.columns.splice(next - 1, 2,  ...[{...element.columns[next - 1], parent: id}, {...element.columns[next], parent: id}, { title: 'test-merge', id }] );
                break;
              }
              // bubbling to first level
              if (index === 0) {
                console.log(data[index].index);
                const eIndex = data[index].index
                // cols.splice(eIndex - 1, 2, { title: 'test-merge', columns: [columns[eIndex - 1], columns[eIndex]], })
                cols.splice(eIndex - 1, 2, ...[{...columns[eIndex - 1], parent: id}, {...columns[eIndex], parent: id}, { title: 'test-merge', id }])
              }
            }
            break;
          case 'afterMerge':
            // first level
            if (data.length === 1) {
              const element = data[0];
              // cols.splice(element.index, 2, { title: 'test-merge', columns: [columns[element.index], columns[element.index + 1]], })
              cols.splice(element.index, 2, ...[{...columns[element.index], parent: id}, {...columns[element.index + 1], parent: id}, { title: 'test-merge', id }])
            }
            for (let index = data.length - 2; index >= 0; index--) {
              const element = data[index].data;
              const next = data[index + 1].index;
              if (next < element.columns.length) {
                // element.columns.splice(next, 2, { title: 'test-merge', columns: [element.columns[next], element.columns[next + 1]], });
                element.columns.splice(next, 2,  ...[{...element.columns[next], parent: id}, {...element.columns[next + 1], parent: id}, { title: 'test-merge', id }]);
                break;
              }
              // bubbling to first level
              if (index === 0) {
                console.log(data[index].index);
                const eIndex = data[index].index
                cols.splice(eIndex - 1, 2, { title: 'test-merge', columns: [columns[eIndex], columns[eIndex + 1]], })
                cols.splice(eIndex - 1, 2, { title: 'test-merge', columns: [columns[eIndex], columns[eIndex + 1]], })
              }
            }
            break;
          default:
            break;
        }
        console.log('---result---', cols);


        setColumns([...cols])
      })
      instance.on('change_header_position', (args) => {
        console.log('---args---', args);

      })
      instance.on('click_cell', (...args) => {
        console.log('click_cell', args);
        
      })
      // console.log('---ListTable.EVENT_TYPE---', ListTable.EVENT_TYPE);
      // instance.on(ListTable.EVENT_TYPE)
    }
  }
  console.log('--columnsSchema--', columnsSchema);
  const onClick = () => {
    tableInstance.current!.options.columns.push( {
      field: 'name',
      title: 'name',
      editor: 'text-editor',
      width: 'auto',
       customRender(args) {
        return {
          elements: [
            {
              type: 'text',
              fill: 'white',
              fontSize: 20,
              fontWeight: 500,
              textBaseline: 'middle',
              text: args.dataValue,
              schema: {
                name: 'test'
              }
              // text:
              //   col === 1
              //     ? row === 1
              //       ? 'important & urgency'
              //       : 'not important but urgency'
              //     : row === 1
              //     ? 'important but not urgency'
              //     : 'not important & not urgency',
              // x: left + 50,
              // y: top - 5
            }
          ]
      }
    }})
    // tableInstance.current.render()
    tableInstance.current.updateOption(tableInstance.current!.options)
  }

  return <>
    <ListTable {...options} style={{ zIndex: 11 }} onReady={onReady} ReactDOM={ReactDom}>
      {
        columns.map((s, index) => {
          // console.log('----s-----', s);
          // const options = s['x-component-props']['options'];
          // const options = {
          //   field: 'name',
          //   title: 'name',
          //   editor: 'text-editor',
          //   width: 'auto',
          // };
          return <>
          <ListColumn key={s.field} {...s} />
          </>
        })
      }
      {/* {
        columns.map((col) => {
          return <ListColumn key={col.field}   {...col} >
            <TempCom role={'header-custom-layout'} />
          </ListColumn>
        })
      } */}
      {/* <UserProfileComponent role={'header-custom-layout'} />
            <UserProfileComponent role={'custom-layout'} /> */}
    </ListTable>
    <div className={styles['page-container']} >
      {/* <Pagination showQuickJumper defaultCurrent={1} total={500} onChange={onPageChange} /> */}
      {tableInitializerExists && tableInitializerRender()}
      {/* <h1 onClick={onClick}>123</h1> */}
    </div>
  </>
}, {
  displayName: 'editableTable'
});

EditableTable.Column = EditableTableColumn;

EditableTable.Column.Decorator = EditableTableColumnDecorator;

export default EditableTable;
