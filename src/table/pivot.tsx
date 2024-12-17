import * as ReactVTable from '@visactor/react-vtable';
import { pivotData } from '../utils';

const Page = () => {


  return <div style={{width: '100%', height: 400}}>
    <ReactVTable.PivotTable records={pivotData}>
      <ReactVTable.PivotColumnHeaderTitle
        title={true}
        headerStyle={{
          textStick: true
        }}
      />
      <ReactVTable.PivotColumnDimension dimensionKey={'Category'} title={'Category'} width={'auto'} />
      <ReactVTable.PivotRowDimension
        dimensionKey={'City'}
        title={'City'}
        drillUp={true}
        width={'auto'}
        headerStyle={{
          textStick: true
        }}
      />
      <ReactVTable.PivotIndicator
        indicatorKey={'Quantity'}
        title={'Quantity'}
        width={'auto'}
        headerStyle={{
          fontWeight: 'normal'
        }}
        style={{
          padding: [16, 28, 16, 28],
          color(args) {
            if (args.dataValue >= 0) return 'black';
            return 'red';
          }
        }}
      />
      <ReactVTable.PivotIndicator
        indicatorKey={'Sales'}
        title={'Sales'}
        width={'auto'}
        headerStyle={{
          fontWeight: 'normal'
        }}
        style={{
          padding: [16, 28, 16, 28],
          color(args) {
            if (args.dataValue >= 0) return 'black';
            return 'red';
          }
        }}
      />
      <ReactVTable.PivotIndicator
        indicatorKey={'Profit'}
        title={'Profit'}
        width={'auto'}
        headerStyle={{
          fontWeight: 'normal'
        }}
        style={{
          padding: [16, 28, 16, 28],
          color(args) {
            if (args.dataValue >= 0) return 'black';
            return 'red';
          }
        }}
      />
      <ReactVTable.PivotCorner
        titleOnDimension={'row'}
        headerStyle={{
          fontWeight: 'bold'
        }}
      />
    </ReactVTable.PivotTable>
  </div>
}

export default Page;
