import type { EditContext, IEditor, RectProps } from '@visactor/vtable-editors';
import ReactDom from 'react-dom/client';
import React from 'react';
import { InputNumber, InputNumberProps } from 'antd';


export interface NumberEditorConfig {
  readonly?: boolean;
  validator?: Array<Record<string, any>>
}

class NumberEditor implements IEditor {
  editorType: string = 'Number';
  editorConfig: NumberEditorConfig;
  container: HTMLElement;
  successCallback?: () => void;
  element: HTMLInputElement;
  errorElement: HTMLDivElement;

  constructor(editorConfig: NumberEditorConfig) {
    this.editorConfig = editorConfig;
  }

  setValue(value: string) {
    this.element.value = typeof value !== 'undefined' ? value : '';
  }

  getValue() {
    return this.element.value;
  }

  onStart({ value, referencePosition, container, endEdit }: EditContext<string>) {
    this.container = container;
    this.successCallback = endEdit;
    if (!this.element) {
      this.createElement();

      if (value !== undefined && value !== null) {
        this.setValue(value);
      }
      if (referencePosition?.rect) {
        this.adjustPosition(referencePosition.rect);
      }
    }
    this.element.focus();
    // do nothing
  }

  createElement() {
    const div = document.createElement('div');
    // input.setAttribute('type', 'text');
    // if (this.editorConfig?.readonly) {
    //   input.setAttribute('readonly', `${this.editorConfig.readonly}`);
    // }
    // input.addEventListener('input', (e) => {
    //   console.log('---oninput---', e.target.value);
    // });
    div.style.position = 'absolute';
    // div.style.padding = '4px';
    div.style.width = '100%';
    div.style.boxSizing = 'border-box';
    div.style.backgroundColor = '#FFFFFF';
    this.element = div;
    this.root = ReactDom.createRoot(div);

    const onChange: InputNumberProps['onChange'] = (value) => {
      // console.log('changed', value);
      this.element.value = value;
    };

    this.root.render(
      <InputNumber
        min={1} max={10}
        defaultValue={3}
        onChange={onChange}
        style={{width: '100%', height: '100%'}}
      />
    );

    this.container.appendChild(div);


    // ---error element---
    // const errorElement = document.createElement('div');
    // errorElement.style.position = 'absolute';
    // errorElement.style.width = '100%';
    // errorElement.style.boxSizing = 'border-box';
    // errorElement.style.backgroundColor = 'fff';
    // errorElement.style.color = 'red';
    // errorElement.style.zIndex = '999';
    // this.errorElement = errorElement;
    // this.container.appendChild(errorElement);

    // 监听键盘事件
    // input.addEventListener('keydown', (e: KeyboardEvent) => {
    //   if (e.key === 'a' && (e.ctrlKey || e.metaKey)) {
    //     // 阻止冒泡  防止处理成表格全选事件
    //     e.stopPropagation();
    //   }
    // });
  }

  adjustPosition(rect: RectProps) {
    this.element.style.top = rect.top + 'px';
    this.element.style.left = rect.left + 'px';
    this.element.style.width = rect.width + 'px';
    this.element.style.height = rect.height + 'px';
    this.errorElement.style.top = rect.top + rect.height + 'px';
    this.errorElement.style.left = rect.left + 'px';
    // this.errorElement.style.width = rect.width + 'px';
    // this.errorElement.style.height = rect.height + 'px';
  }


  onEnd() {
    this.element.value = null;
    // do nothing
    if (this.container?.contains(this.element)) {
      this.container.removeChild(this.element);
    }
    if (this.container?.contains(this.errorElement)) {
      this.container.removeChild(this.errorElement);
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
      this.errorElement.innerHTML = '';
      new Set(result.error)?.forEach((error) => {
        this.errorElement.innerHTML += `${error}<br>`;
      });
      return ValidateEnum.invalidateNotExit;
    }
    return ValidateEnum.validateExit;
  }

}


export default NumberEditor;