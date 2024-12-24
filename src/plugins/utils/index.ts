import { Schema } from "@formily/react";
import { VariableOption, VariablesContextType } from "../types/linkage";
import { collectFieldStateOfLinkageRules, getFieldNameByOperator } from "./linkage";

export const isColumnComponent = (schema: Schema) => {
  return schema['x-component']?.endsWith('.Column') > -1;
};

export const findDataByColumns = (opts, columns) => {
  const { row, col } = opts;
  // let index = col;
  // if (col > columns.length) {
  //   index = columns.length;
  // }else if (col - row  < )
  const index = (col > columns.length ? columns.length : col) - 1;
  const column = columns[index];
  const results: any[] = [{data: column, index}]
  let res = column, i = index;
  for (let index = 0; index < row; index++) {
    const { columns } = res;
    if (!columns) break;
    const indey =  (col - i > columns.length ? columns.length : col - i) - 1;
    res = columns[indey];
    i = i + indey;
    results.push({data: res, index: indey})
  }
  // return res;
  return results;
  // if ()
}

export const  getMaxDepth = (columns) => {
  // 定义递归函数，初始深度为 1
  function findDepth(cols, depth) {
    // 初始化当前最大深度
    let maxDepth = depth;
    // 遍历当前层级的每一列
    cols.forEach(col => {
      // 如果存在子列，递归计算其深度
      if (col.columns && col.columns.length > 0) {
        const childDepth = findDepth(col.columns, depth + 1);
        // 更新最大深度
        if (childDepth > maxDepth) {
          maxDepth = childDepth;
        }
      }
    });
    return maxDepth;
  }
  // 从初始层级开始计算
  return findDepth(columns, 1);
}

export function findElementWithParents(columns, targetField) {
  // 内部递归函数，用于遍历列配置
  function traverse(cols, field, path) {
    for (let [index, col] of cols.entries()) {
      // 创建当前路径的副本，并添加当前列
      const currentPath = [...path, {data: col, index}];
      // 检查当前列的 field 是否匹配目标 field
      if (col.field === field) {
        return currentPath;
      }
      // 如果存在子列，递归遍历子列
      if (col.columns) {
        const result = traverse(col.columns, field, currentPath);
        if (result) {
          return result;
        }
      }
    }
    // 如果未找到匹配的列，返回 null
    return null;
  }
  // 从根级开始遍历，初始路径为空数组
  return traverse(columns, targetField, []);
}

export function arrayToTree(arr) {
  const lookup = {};
  const tree = [];

  // 创建一个查找表，用于快速找到每个节点
  arr.forEach(item => {
    lookup[item.id] = item;
  });

  // 构建树结构
  arr.forEach(item => {
    if (item.parent) {
      // 如果有父节点，将其加入父节点的 columns
      const parent = lookup[item.parent];
      if (parent) {
        if (!parent.columns) parent.columns = []
        parent.columns.push(lookup[item.id]);
      }
    } else {
      // 如果没有父节点，则为根节点
      tree.push(lookup[item.id]);
    }
  });

  return tree;
}


export function getSubscriber(
  action: any,
  field: any,
  rule: any,
  variables: VariablesContextType,
  localVariables: VariableOption[],
): (value: string, oldValue: string) => void {
  return () => {
    // 当条件改变触发 reaction 时，会同步收集字段状态，并保存到 field.stateOfLinkageRules 中
    console.log('---field.stateOfLinkageRules1---', field.stateOfLinkageRules);
    
    collectFieldStateOfLinkageRules({
      operator: action.operator,
      value: action.value,
      field,
      condition: rule.condition,
      variables,
      localVariables,
    });
    console.log('---field.stateOfLinkageRules2---', field.stateOfLinkageRules);

    // 当条件改变时，有可能会触发多个 reaction，所以这里需要延迟一下，确保所有的 reaction 都执行完毕后，
    // 再从 field.stateOfLinkageRules 中取值，因为此时 field.stateOfLinkageRules 中的值才是全的。
    setTimeout(async () => {
      const fieldName = getFieldNameByOperator(action.operator);
      console.log('---fieldName---', fieldName);
      
      // 防止重复赋值
      if (!field.stateOfLinkageRules?.[fieldName]) {
        return;
      }

      let stateList = field.stateOfLinkageRules[fieldName];

      stateList = await Promise.all(stateList);
      console.log('---stateList---', stateList);
      
      stateList = stateList.filter((v) => v.condition);

      const lastState = stateList[stateList.length - 1];
      console.log('---lastState?.value---', lastState?.value);
      
      if (fieldName === 'value') {
        // value 比较特殊，它只有在匹配条件时才需要赋值，当条件不匹配时，维持现在的值；
        // stateList 中肯定会有一个初始值，所以当 stateList.length > 1 时，就说明有匹配条件的情况；
        if (stateList.length > 1) {
          field.value = lastState.value;
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
  };
}
