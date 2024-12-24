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
  console.log('table provider', fieldSchema.toJSON());
  const linkageRules: any[] = fieldSchema['x-linkage-rules'] || [];
  // linkageRules.forEach((rule) => {
  //   rule.actions?.forEach((action) => {
  //     if (action.targetFields?.length) {
  //       const fields = action.targetFields.join(',');
  //       const disposes = [];

  //       // 之前使用的 `onFieldReact` 有问题，没有办法被取消监听，所以这里用 `onFieldInit` 和 `reaction` 代替
  //       onFieldInit(`*(${fields})`, (field: any, form) => {
  //         field['initStateOfLinkageRules'] = {
  //           display: field.initStateOfLinkageRules?.display || getTempFieldState(true, field.display),
  //           required: field.initStateOfLinkageRules?.required || getTempFieldState(true, field.required || false),
  //           pattern: field.initStateOfLinkageRules?.pattern || getTempFieldState(true, field.pattern),
  //           value:
  //             field.initStateOfLinkageRules?.value || getTempFieldState(true, field.value || field.initialValue),
  //         };

  //         disposes.push(
  //           reaction(
  //             // 这里共依赖 3 部分，当这 3 部分中的任意一部分发生变更后，需要触发联动规则：
  //             // 1. 条件中的字段值；
  //             // 2. 条件中的变量值；
  //             // 3. value 表达式中的变量值；
  //             () => {
  //               // 获取条件中的字段值
  //               const fieldValuesInCondition = getFieldValuesInCondition({ linkageRules, formValues: form.values });

  //               // 获取条件中的变量值
  //               const variableValuesInCondition = getVariableValuesInCondition({ linkageRules, localVariables });

  //               // 获取 value 表达式中的变量值
  //               const variableValuesInExpression = getVariableValuesInExpression({ action, localVariables });

  //               const result = [fieldValuesInCondition, variableValuesInCondition, variableValuesInExpression]
  //                 .map((item) => JSON.stringify(item))
  //                 .join(',');
  //               return result;
  //             },
  //             getSubscriber(action, field, rule, variables, localVariables),
  //             { fireImmediately: true, equals: _.isEqual },
  //           ),
  //         );
  //       });
  //     }
  //   });
  // });

  return <BlockProvider name={props.name || 'table'} {...props} params={params} runWhenParamsChanged>
    <LinkageRulesProvider value={{ linkageRules }}>
      <InternalTableBlockProvider {...props} childrenColumnName={childrenColumnName} params={params} />
      {/* {props.children} */}
    </LinkageRulesProvider>
  </BlockProvider>
});

export default EditableTableBlockProvider;
