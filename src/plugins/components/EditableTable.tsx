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

// const initialColumns1 = [
//   {
//     field: 'name',
//     title: 'name',
//     width: 100
//   },
//   {
//     title: 'Name',
//     columns: [
//       {
//         field: 'age',
//         // title: 'age',
//         title: 'age',
//         width: 100
//       },
//       {
//         title: 'name-level-2',
//         width: 150,
//         columns: [
//           {
//             title: 'name-level-3',
//             width: 150,
//             columns: [
//               {
//                 field: 'gender',
//                 title: 'gender',
//                 width: 100
//               },
//               {
//                 title: 'hobby',
//                 field: 'hobby',
//                 width: 150
//               }
//             ]
//           }
//         ]
//       }
//     ]
//   }
// ];

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

const UserProfileComponent = props => {
  console.log('---props1---', props)
  const { table, row, col, rect, dataValue } = props;
  if (!table || row === undefined || col === undefined) {
    return null;
  }
  const { height, width } = rect || table.getCellRect(col, row);
  const record = table.getRecordByCell(col, row);

  const [hover, setHover] = React.useState(false);

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
    >
      <Group
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
            container: table.bodyDomContainer, // table.headerDomContainer
            anchorType: 'bottom-right',
            element: <CardInfo record={record} hover={hover} row={row} />
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
      >
        <Image
          attribute={{
            width: 20,
            height: 20,
            image: record.bloggerAvatar,
            cornerRadius: 10,
            boundsPadding: [0, 0, 0, 10],
            cursor: 'pointer'
          }}
        />
        <Text
          attribute={{
            text: dataValue,
            fontSize: 14,
            fontFamily: 'sans-serif',
            fill: 'rgb(51, 101, 238)',
            boundsPadding: [0, 0, 0, 10],
            cursor: 'pointer'
          }}
        />
      </Group>
    </Group>
  );
};

const CardInfo = props => {
  const { bloggerName, bloggerAvatar, introduction, city } = props.record;
  return <h1>123</h1>
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
  const [columns, setColumns] = React.useState(initialColumns)

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
        if (row < maxDepth) {
          return [
            { text: '与前一列合并', menuKey: 'beforeMerge', },
            { text: '与后一列合并', menuKey: 'afterMerge', }
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
    // customRender() {
    // }
  };

  const onReady = (instance: IVTable, isInitial: boolean) => {
    if (isInitial) {
      tableInstance.current = instance;
      instance.on('dropdown_menu_click', (args) => {
        console.log('dropdown_menu_click', args);
        const { menuKey, col, field, row, cellLocation } = args;
        console.log('col：', col, 'row：', row, 'field：', field);
        console.log('---columns---',JSON.parse(JSON.stringify(columns)));
        // const data = findDataByColumns(args, columns);
        const data = findElementWithParents(columns, field)
        
        switch (menuKey) {
          case 'beforeMerge':
            // first level
            if (data.length === 1) {
              const element = data[0];
              columns.splice(element.index - 1, 2, { title: 'test-merge', columns: [columns[element.index - 1], columns[element.index]],  })
            }
            for (let index = data.length - 2; index >= 0; index--) {
              const element = data[index].data;
              const next = data[index + 1].index;
              if (next > 0) {
                element.columns.splice(next - 1, 2, { title: 'test-merge', columns: [element.columns[next - 1], element.columns[next]],  });
                break;
              }
              // bubbling to first level
              if (index === 0) {
                console.log(data[index].index);
                const eIndex = data[index].index
                columns.splice(eIndex - 1, 2, { title: 'test-merge', columns: [columns[eIndex - 1], columns[eIndex]],  })
              }
            }
            break;
          case 'afterMerge':
             // first level
             if (data.length === 1) {
              const element = data[0];
              columns.splice(element.index, 2, { title: 'test-merge', columns: [columns[element.index], columns[element.index + 1]],  })
            }
            for (let index = data.length - 2; index >= 0; index--) {
              const element = data[index].data;
              const next = data[index + 1].index;
              if (next < element.columns.length) {
                element.columns.splice(next, 2, { title: 'test-merge', columns: [element.columns[next], element.columns[next + 1]],  });
                break;
              }
              // bubbling to first level
              if (index === 0) {
                console.log(data[index].index);
                const eIndex = data[index].index
                columns.splice(eIndex - 1, 2, { title: 'test-merge', columns: [columns[eIndex], columns[eIndex + 1]],  })
              }
            }
            break;
          default:
            break;
        }
        console.log('---result---', columns);
        
        setColumns([...columns])
      })
      instance.on('change_header_position', (args) => {
        console.log('---args---', args);
        
      })
      // console.log('---ListTable.EVENT_TYPE---', ListTable.EVENT_TYPE);
      // instance.on(ListTable.EVENT_TYPE)
    }
  }

  
  return <>
    <ListTable {...options} style={{ zIndex: 11 }} onReady={onReady} ReactDOM={ReactDom}>
      {/* {
        columnsSchema.map((s, index) => {
          const col = s['x-component-props']['options']
          return <ListColumn key={col.field} {...col} ></ListColumn>
        })
      } */}
      {
        columns.map((col) => {
          return <ListColumn key={col.field} {...col} ><UserProfileComponent role={'custom-layout'} /></ListColumn>
        })
      }
    </ListTable>
    <div className={styles['page-container']}>
      {/* <Pagination showQuickJumper defaultCurrent={1} total={500} onChange={onPageChange} /> */}
      {tableInitializerExists && tableInitializerRender()}
    </div>
  </>
}, {
  displayName: 'editableTable'
});

EditableTable.Column = EditableTableColumn;

EditableTable.Column.Decorator = EditableTableColumnDecorator;

export default EditableTable;
