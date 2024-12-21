import { RecursionField, Schema, useFieldSchema } from "@formily/react"
import React from "react"
import { useACLFieldWhitelist } from '@zebras/noco-core/client';
import { isColumnComponent } from "../utils";

export const SettingsRender = () => {
  const fieldSchema = useFieldSchema();
  const { schemaInWhitelist } = useACLFieldWhitelist();

  const columnsSchema = fieldSchema.reduceProperties((buf, s) => {
    if (isColumnComponent(s) && schemaInWhitelist(Object.values(s.properties || {}).pop())) {
      return buf.concat([s]);
    }
    return buf;
  }, []);

  return <>
    {
      columnsSchema.map((s: Schema) => {
         return <RecursionField name={s.name} schema={s} onlyRenderSelf />
      })
    }
  </>
}