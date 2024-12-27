import type { EditContext, IEditor, RectProps } from '@visactor/vtable-editors';
import ReactDom from 'react-dom/client';
import React from 'react';
import { Select } from 'antd';

export interface ListEditorConfig {
  enums: Array<{ value: string; label: string, color: string }>;
}


class AntdSelectEditor implements IEditor {
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
    const div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.width = '100%';
    div.style.padding = '1px';
    div.style.boxSizing = 'border-box';
    div.style.backgroundColor = '#232324';
    this.container.appendChild(div);
    const { enums } = this.editorConfig;
    this.root = ReactDom.createRoot(div);
    this.root.render(
      <Select
        getPopupContainer={() => div}
        onChange={value => { this.currentValue = value; }}
        defaultOpen
        popupClassName={'antd-select-vtable'}
        defaultValue={value}
        style={{ width: '100%', height: '100%' }}
        options={enums.map(({ value, label, color }) => ({ value, label: <span style={{ color }}>{label}</span> }))}
      />
    );
    this.element = div;
  }


  getValue() {
    return this.currentValue;
  }

  setValue(value) {
    this.currentValue = value;
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
    return this.element.contains(target) || this.isClickPopUp(target);
  }

  isClickPopUp(target) {
    while (target) {
      if (target.classList && target.classList.contains('antd-select-vtable')) {
        return true;
      }
      // 如果到达了DOM树的顶部，则停止搜索
      target = target.parentNode;
    }
    // 如果遍历结束也没有找到符合条件的父元素，则返回false
    return false;
  }
}


export default AntdSelectEditor;