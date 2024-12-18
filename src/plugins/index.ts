import {  Plugin} from '@zebras/noco-core/client';
import { EditableTablePlugin } from './context';
import { createEditorTablebBlockUISchema } from './initializers/createEditorTableBlockUISchema';
import { editableTableColumnInitializers } from './initializers/components/TableColumnInitializers';


class PluginTableEditor extends Plugin {

  async load() {
    this.app.use(EditableTablePlugin);
    this.app.schemaInitializerManager.add(editableTableColumnInitializers);

    const blockInitializers = this.app.schemaInitializerManager.get('page:addBlock');
    blockInitializers?.add('dataBlocks.editorTable', {
      name: 'editorTable',
      title: '{{t("Editor Table")}}',
      Component: 'EditorTableBlockInitializer',
      chooseCollection: true,
      insertBehavior: createEditorTablebBlockUISchema,
    });

  }
}

export default PluginTableEditor;
