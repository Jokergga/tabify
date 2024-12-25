import { Plugin } from '@zebras/noco-core/client';
import { EditableTablePlugin } from './context';
import { createEditorTablebBlockUISchema } from './initializers/createEditorTableBlockUISchema';
import { editableTableColumnInitializers } from './initializers/components/TableColumnInitializers';
import { tableColumnSettings } from './settings/tableColumnSettings';
import { tableBlockSettings } from './settings/tableBlockSettings';
import { useEditableTableBlockDecoratorProps } from './scopes/useEditableTableBlockDecoratorProps';

class PluginTableEditor extends Plugin {

  async load() {
    this.app.use(EditableTablePlugin);
    this.app.schemaInitializerManager.add(editableTableColumnInitializers);
    this.schemaSettingsManager.add(tableColumnSettings);
    this.schemaSettingsManager.add(tableBlockSettings);

    const blockInitializers = this.app.schemaInitializerManager.get('page:addBlock');
    blockInitializers?.add('dataBlocks.editorTable', {
      name: 'editorTable',
      title: '{{t("Editor Table")}}',
      Component: 'EditorTableBlockInitializer',
      chooseCollection: true,
      insertBehavior: createEditorTablebBlockUISchema,
    });

    this.app.addScopes({
      useEditableTableBlockDecoratorProps
    })

  }
}

export default PluginTableEditor;
