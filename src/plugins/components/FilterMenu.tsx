import SearchOutlined from "@ant-design/icons/SearchOutlined";
import { Button, Checkbox, Input, Menu, Space } from "antd";
import { createStyles } from "antd-style";
import { AnyObject } from "antd/es/_util/type";
import React from "react";

const useStyles = createStyles(({ css, token }) => {
  return {
    tableFilterContainer: css`
      background: #fff;
    `,
    filterSearch: css`
      padding: ${token.paddingXS}px;
      border-bottom: 1px solid #f0f0f0;
    `,
    searchInput: css`
    `,
    filterBtns: css`
      display: flex;
      justify-content: space-between;
      padding: ${token.paddingXS}px;
      border-top: 1px solid #f0f0f0;
    `,

  };
});

type IProps = {
  onChange: (value: string[]) => void;
  enums: { label: string, value: string }[];
}

const FilterMenu = (props) => {
  const { enums } = props;
  const [filteredKeys, setFilteredKeys] = React.useState<React.Key[]>([]);
  const { styles } = useStyles();


  const items = enums.map((item) => (
    {
      // key: filter.value !== undefined ? key : index,
      key: item.value,
      label: (
        <Space size={5}>
          <Checkbox checked={filteredKeys.includes(item.value)} />
          <span >{item.label}</span>
        </Space>
      ),
    }
  ));

  const onOpenChange = (openKeys: React.Key[]) => {
    console.log(openKeys, 'openKeys');
  }

  const onSelectKeys = (e) => {
    e.domEvent.preventDefault();
    console.log('----onSelectKeys---', e);

    setFilteredKeys(e.selectedKeys);
  }

  const onSearchChange = (e) => {
  }

  const onReset = () => {
    setFilteredKeys([]);
  }

  const onConfirm = () => {
    console.log('---onConfirm---', filteredKeys);
    props.onChange(filteredKeys);
  }

  return (
    <div className={styles['tableFilterContainer']}>
      <FilterSearch filterSearch onChange={onSearchChange} />
      <Menu
        selectable
        multiple
        // prefixCls={`${dropdownPrefixCls}-menu`}
        // className={dropdownMenuClass}
        onSelect={onSelectKeys}
        onDeselect={onSelectKeys}
        // selectedKeys={selectedKeys}
        // getPopupContainer={getPopupContainer}
        openKeys={[]}
        onOpenChange={onOpenChange}
        items={items}
      />
      <div className={styles['filterBtns']}>
        <Button type="link" size="small" disabled={Boolean(filteredKeys.length)} onClick={() => onReset()}>
          {/* {locale.filterReset} */}
          重置
        </Button>
        <Button type="primary" size="small" onClick={onConfirm}>
          {/* {locale.filterConfirm} */}
          确定
        </Button>
      </div>
    </div>

  );
}

export default FilterMenu;

interface FilterSearchProps<RecordType = AnyObject> {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  filterSearch: boolean;
  // tablePrefixCls: string;
  // locale: TableLocale;
}


const FilterSearch = <RecordType extends AnyObject = AnyObject>(
  props: FilterSearchProps<RecordType>,
) => {
  const { value, filterSearch, onChange } = props;
  const { styles } = useStyles();
  if (!filterSearch) {
    return null;
  }
  return (
    <div className={styles[`filterSearch`]}>
      <Input
        prefix={<SearchOutlined />}
        placeholder={'在筛选项中搜索'}
        onChange={onChange}
        value={value}
        // for skip min-width of input
        htmlSize={1}
        className={styles[`searchInput`]}
      />
    </div>
  );
}; 