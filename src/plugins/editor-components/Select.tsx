import type { EditContext, IEditor,  RectProps } from '@visactor/vtable-editors';

export interface ListEditorConfig {
  enums: Array<{ value: string; label: string, color: string }>;
}

 class SelectEditor implements IEditor {
  editorType: string = 'Input';
  input?: HTMLInputElement;
  editorConfig?: ListEditorConfig;
  container?: HTMLElement;
  element?: HTMLSelectElement;
  successCallback?: () => void;

  constructor(editorConfig: ListEditorConfig) {
    console.log('listEditor constructor');
    this.editorConfig = editorConfig;
  }

  createElement(value: string) {
    // create select tag
    const select = document.createElement('select');
    select.setAttribute('type', 'text');
    select.style.position = 'absolute';
    select.style.padding = '4px';
    select.style.width = '100%';
    select.style.boxSizing = 'border-box';
    select.style.backgroundColor = '#FFFFFF';
    this.element = select;
    // create option tags
    const { enums } = this.editorConfig;
    let opsStr = '';
    enums.forEach(item => {
      opsStr +=
        item.value === value
          ? `<option value="${item.value}" selected>${item.label}</option>`
          : `<option value="${item.value}" >${item.label}</option>`;
    });
    select.innerHTML = opsStr;

    this.container.appendChild(select);
    // this._bindSelectChangeEvent();
  }

  _bindSelectChangeEvent() {
    this.element.addEventListener('change', (v) => {
      // this.successCallback();
    });
  }

  setValue(value: string) {
    // do nothing
    this.element.value = typeof value !== 'undefined' ? value : '';
  }

  getValue() {
    return this.element.value;
  }

  onStart({ container, value, referencePosition, endEdit }: EditContext) {
    this.container = container;
    this.successCallback = endEdit;

    this.createElement(value);

    if (value !== undefined && value !== null) {
      this.setValue(value);
    }
    if (referencePosition?.rect) {
      this.adjustPosition(referencePosition.rect);
    }
    this.element.focus();
  }

  adjustPosition(rect: RectProps) {
    this.element.style.top = rect.top + 'px';
    this.element.style.left = rect.left + 'px';
    this.element.style.width = rect.width + 'px';
    this.element.style.height = rect.height + 'px';
  }

  endEditing() {
    // do nothing
  }

  onEnd() {
    this.container.removeChild(this.element);
  }

  isEditorElement(target: HTMLElement) {
    return target === this.element;
  }
}


export default SelectEditor;