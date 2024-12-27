import type { EditContext, IEditor, RectProps, } from '@visactor/vtable-editors';
import { validate } from '@formily/validator'
import { Input } from 'antd';
import ReactDom from 'react-dom/client';
import React from 'react';

const { TextArea } = Input;

type CellAddress = {
  col: number;
  row: number;
};

enum ValidateEnum {
  validateExit = 'validate-exit',
  invalidateExit = 'invalidate-exit',
  validateNotExit = 'validate-not-exit',
  invalidateNotExit = 'invalidate-not-exit'
}

export interface TextAreaEditorConfig {
  readonly?: boolean;
  validator?: Array<Record<string, any>>
}
class AntdTextAreaEditor implements IEditor {
  editorType: string = 'Input';
  editorConfig: TextAreaEditorConfig;
  container: HTMLElement;
  successCallback?: () => void;
  element?: HTMLDivElement;
  errorElement?: HTMLDivElement;
  root: React.Root;
  currentValue: string;

  constructor(editorConfig?: TextAreaEditorConfig) {
    this.editorConfig = editorConfig;
  }

 

  createElement(rect: RectProps) {
    const div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.width = '100%';
    div.style.padding = '1px';
    div.style.boxSizing = 'border-box';
    this.container.appendChild(div);
    this.element = div;
    this.root = ReactDom.createRoot(div);
    const onChange = (e) => {
      this.currentValue = e.target.value;
    }
    this.root.render(<div style={{ position: 'relative', top: rect.height, width: rect.width,  }}>
      <TextArea
        defaultValue={this.currentValue}
        rows={4}
        onChange={onChange} 
        showCount
        autoSize={{ minRows: 3 }}
        autoFocus
      />
    </div>)
  }

  setValue(value: string) {
    this.currentValue = typeof value !== 'undefined' ? value : '';
  }

  getValue() {
    return this.currentValue;
  }

  onStart({ value, referencePosition, container, endEdit }: EditContext<string>) {
    this.currentValue = value;
    this.container = container;
    this.successCallback = endEdit;
    if (!this.element) {
      this.createElement(referencePosition?.rect);

      if (value !== undefined && value !== null) {
        this.setValue(value);
      }
      if (referencePosition?.rect) {
        this.adjustPosition(referencePosition.rect);
      }
    }
    // this.element.focus();
  }

  adjustPosition(rect: RectProps) {
    this.element!.style.top = rect.top + 'px';
    this.element!.style.left = rect.left + 'px';
    this.element!.style.width = rect.width + 'px';
    this.element!.style.height = rect.height + 'px';
    // this.errorElement.style.top = rect.top + rect.height + 'px';
    // this.errorElement.style.left = rect.left + 'px';
    // this.errorElement.style.width = rect.width + 'px';
    // this.errorElement.style.height = rect.height + 'px';
  }

  endEditing() {
    // do nothing
  }

  onEnd() {
    this.currentValue = '';
    // do nothing
    if (this.container?.contains(this.element!)) {
      this.container.removeChild(this.element!);
    }
    if (this.container?.contains(this.errorElement!)) {
      this.container.removeChild(this.errorElement!);
    }
    this.element = undefined;
    this.errorElement = undefined;
  }

  isEditorElement(target: HTMLElement) {
    return target === this.element;
  }

  async validateValue(newValue?: any, oldValue?: any, position?: CellAddress, table?: any): boolean | ValidateEnum {
    const result = await validate(newValue, this.editorConfig?.validator);
    if (result.error.length) {
      this.element.style.border = '1px solid red';
      this.element?.focus();
      this.errorElement!.innerHTML ='';
      new Set(result.error)?.forEach((error) => {
        this.errorElement!.innerHTML += `${error}<br>`;
      });
      return ValidateEnum.invalidateNotExit;
    }
    return ValidateEnum.validateExit;
  }
}

export default AntdTextAreaEditor;
