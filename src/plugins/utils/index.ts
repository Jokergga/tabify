
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