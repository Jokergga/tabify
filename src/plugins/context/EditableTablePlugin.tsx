import React from "react";
import { SchemaComponentOptions } from '@zebras/noco-core/client';
import { EditableTable } from "../components";

const EditableTablePlugin = (props) => {

  return <SchemaComponentOptions components={{ EditableTable }}>
    {props.children}
  </SchemaComponentOptions>
}

export default EditableTablePlugin