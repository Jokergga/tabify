import type { EditContext, IEditor, RectProps, } from '@visactor/vtable-editors';
import ReactDom from 'react-dom/client';
import React from 'react';
import { DatePicker } from 'antd';
import Pikaday from 'pikaday';
import 'pikaday/css/pikaday.css';

export interface DateEditorConfig {
  // readonly?: boolean;
  // validator?: Array<Record<string, any>>
}

class DateEditor implements IEditor {
  editorType: string = 'Date';
  editorConfig: DateEditorConfig;
  container: HTMLElement;
  successCallback?: () => void;
  element?: HTMLInputElement;
  errorElement?: HTMLDivElement;

  constructor(editorConfig: DateEditorConfig) {
    this.editorConfig = editorConfig;
  }

  // createElement() {
  //   const element = document.createElement('div');
  //   element.style.position = 'absolute';
  //   const root = ReactDom.createRoot(element);
  //   root.render(<DatePicker ref={(ref) => {
  //     console.log('DatePicker ref', ref);
  //     ref?.focus();
  //   }} />);
  //   this.element = element;
  //   this.container.appendChild(element);
  // }

  setValue(value: string) {
    console.log('---value---', value, typeof value);
    
    this.element.value = typeof value !== 'undefined' ? value : '';
  }

  getValue() {
    return this.element.value;
  }

  onStart({ value, referencePosition, container, endEdit }: EditContext<string>) {
    const that = this;
    this.container = container;
    this.successCallback = endEdit;
    const input = document.createElement('input');

    input.setAttribute('type', 'text');
    input.style.padding = '4px';
    input.style.width = '100%';
    input.style.boxSizing = 'border-box';
    input.style.position = 'absolute';
    input.value = value;
    this.element = input;
    container.appendChild(input);

    const picker = new Pikaday({
      field: input,
      format: 'D/M/YYYY',
      toString(date, format) {
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        return `${year}-${month}-${day}`;
      },
      parse(dateString, format) {
        const parts = dateString.split('/');
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        return new Date(year, month, day);
      },
      onSelect() {
        const date = this.getDate();
        that.successCallback();
      }
    });
    this.picker = picker;
    if (referencePosition?.rect) {
      this.adjustPosition(referencePosition.rect);
    }
    this.picker.show();
  }

  adjustPosition(rect: RectProps) {
    this.element.style.top = rect.top + 'px';
    this.element.style.left = rect.left + 'px';
    this.element.style.width = rect.width + 'px';
    this.element.style.height = rect.height + 'px';
  }

  endEditing() {
    console.log('endEditing value: ', this.getValue());
    // do nothing
  }

  onEnd() {
    this.picker.destroy();
    this.container.removeChild(this.element);
  }

  isEditorElement(target: HTMLElement) {
    if (target === this.element || this.picker.el.contains(target)) {
      return true;
    }
    return false;
  }
}

export default DateEditor;
