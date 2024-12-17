import * as ReactVTable from '@visactor/react-vtable';
import { ListTableProps } from "@visactor/react-vtable/es/tables/list-table";
const records = new Array(1000).fill({ name: 'John', age: 18, gender: 'male', hobby: '🏀' });

const columns = [
  {
    field: 'name',
    title: 'name',
    width: 100
  },
  {
    title: 'Name',
    columns: [
      {
        field: 'age',
        title: 'age',
        width: 100
      },
      {
        title: 'name-level-2',
        width: 150,
        columns: [
          {
            field: 'gender',
            title: 'gender',
            width: 100
          },
          {
            title: 'hobby',
            field: 'hobby',
            width: 150
          }
        ]
      }
    ]
  }
];

const options: ListTableProps = {
  records,
  widthMode: 'adaptive',
  menu: {
    // contextMenuItems: ["向下插入数据", "向下插入空行", '修改掉整行值', '修改值', '删除该行']
    contextMenuItems(field, row, col, table) {
      console.log('---test---', field, row, col, table);
      if (row < 3 ) {
        return ['合并']
      }
      return ["向下插入数据", "向下插入空行", '修改掉整行值', '修改值', '删除该行']
    },
  }
}

const Page = () => {

  const onReady = (tableInstance, isFirst) => {
    if (isFirst) {
      tableInstance.on('dropdown_menu_click', (args) => {
        console.log('dropdown_menu_click', args);
        // if (args.menuKey === "向下插入数据") {
        //   const recordIndex = tableInstance.getRecordShowIndexByCell(args.col, args.row);
        //   // tableInstance.addRecords(generatePersons(1),recordIndex+1);
        // } else if (args.menuKey === "向下插入空行") {
        //   const recordIndex = tableInstance.getRecordShowIndexByCell(args.col, args.row);
        //   tableInstance.addRecord({}, recordIndex + 1);
        // } else if (args.menuKey === "删除该行") {
        //   const recordIndex = tableInstance.getRecordShowIndexByCell(args.col, args.row);
        //   tableInstance.deleteRecords([recordIndex]);
        // } else if (args.menuKey === "修改掉整行值") {
        //   const recordIndex = tableInstance.getRecordShowIndexByCell(args.col, args.row);
        //   tableInstance.updateRecords([{
        //     "id": 1111,
        //     "email1": "changed Value",
        //     "name": "changed Value",
        //     "lastName": "changed Value",
        //     "hobbies": "changed Value",
        //     "birthday": "1974-09-25",
        //     "tel": "13237599651",
        //     "sex": "boy",
        //     "work": "back-end engineer",
        //     "city": "beijing"
        //   }], [recordIndex]);
        // } else if (args.menuKey === "修改值") {
        //   tableInstance.startEditCell(args.col, args.row);
        // }
      })
    }

  }


  return <div style={{ width: '100%', height: 400 }}>
    <ReactVTable.ListTable {...options} onReady={onReady} >
      {/* <ReactVTable.ListColumn field={'0'} title={'name'} />
      <ReactVTable.ListColumn field={'1'} title={'age'} />
      <ReactVTable.ListColumn field={'2'} title={'gender'} />
      <ReactVTable.ListColumn field={'3'} title={'hobby'} /> */}
      {columns.map(item => <ReactVTable.ListColumn key={item.title} {...item} />)}
    </ReactVTable.ListTable>
  </div>
}

export default Page;
