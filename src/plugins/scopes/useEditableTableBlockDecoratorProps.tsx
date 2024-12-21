import { useTableBlockParams, useParentRecordCommon } from '@zebras/noco-core/client'

export const useEditableTableBlockDecoratorProps = (props) => {
  const { params, parseVariableLoading } = useTableBlockParams(props);
  const parentRecord = useParentRecordCommon(props.association);
  return {
    params,
    parentRecord,
    parseVariableLoading,
  };
}

