import React from "react";
import { withDynamicSchemaProps, BlockProvider, InternalTableBlockProvider, useTableBlockParams } from '@zebras/noco-core/client'
import { useFieldSchema } from "@formily/react";
import { LinkageRulesProvider } from "./LinkageRulesContext";

const useTableBlockParamsCompat = (props) => {
  const fieldSchema = useFieldSchema();
  let params,
    parseVariableLoading = false;
  // 1. 新版本的 schema 存在 x-use-decorator-props 属性
  if (fieldSchema['x-use-decorator-props']) {
    params = props.params;
    parseVariableLoading = props.parseVariableLoading;
  } else {
    // 2. 旧版本的 schema 不存在 x-use-decorator-props 属性
    // 因为 schema 中是否存在 x-use-decorator-props 是固定不变的，所以这里可以使用 hooks
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const tableBlockParams = useTableBlockParams(props);
    params = tableBlockParams.params;
    parseVariableLoading = tableBlockParams.parseVariableLoading;
  }

  return { params, parseVariableLoading };
};

const getLinkageRules = (fieldSchema) => {
  let linkageRules = null;
  fieldSchema.mapProperties((schema) => {
    if (schema['x-linkage-rules']) {
      linkageRules = schema['x-linkage-rules'];
    }
  });
  return linkageRules;
};


const EditableTableBlockProvider = withDynamicSchemaProps((props) => {
  const { params, parseVariableLoading } = useTableBlockParamsCompat(props);
  const fieldSchema = useFieldSchema();
  let childrenColumnName = 'children';
  const linkageRules: any[] = fieldSchema['x-linkage-rules'] || [];

  return <BlockProvider name={props.name || 'table'} {...props} params={params} runWhenParamsChanged>
    <LinkageRulesProvider value={{ linkageRules }}>
      <InternalTableBlockProvider {...props} childrenColumnName={childrenColumnName} params={params} />
      {/* {props.children} */}
    </LinkageRulesProvider>
  </BlockProvider>
});

export default EditableTableBlockProvider;
