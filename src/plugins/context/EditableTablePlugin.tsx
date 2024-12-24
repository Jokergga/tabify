import React from "react";
import { SchemaComponentOptions } from '@zebras/noco-core/client';
import { EditableTable } from "../components";
import EditableTableBlockProvider from "./EditableTableBlockProvider";

const EditableTablePlugin = (props) => {

  return <SchemaComponentOptions components={{ EditableTable, EditableTableBlockProvider }} >
    {props.children}
  </SchemaComponentOptions>
}

export default EditableTablePlugin