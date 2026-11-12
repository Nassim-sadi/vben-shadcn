/**
 * 通用组件注册：用于 vben-form、vben-modal、vben-drawer 等组件。
 * 本项目直接使用 @vben-core/shadcn-ui 的 shadcn 组件与 app 级组合组件，
 * 不再有 antd 兼容层。
 */

import type { Component } from 'vue';

import type {
  ApiComponentSharedProps,
  BaseFormComponentType,
  CollapsibleParamsProps,
  IconPickerProps,
} from '@vben/common-ui';
import type { Recordable } from '@vben/types';

import { defineComponent, h, ref } from 'vue';
import { toast } from 'vue-sonner';

import {
  ApiComponent,
  globalShareState,
  IconPicker,
  VbenCollapsibleParams,
} from '@vben/common-ui';
import { $t } from '@vben/locales';

import { VbenCheckbox as Checkbox, Input, Switch } from '@vben-core/shadcn-ui';

import {
  DatePickerField,
  DividerField,
  InputNumberField,
  InputSearch,
  RadioGroupField,
  RangePickerField,
  SelectField,
  TextareaField,
  TreeSelectField,
} from '#/components/ui/app';

const withDefaultPlaceholder = (
  component: Component,
  type: 'input' | 'select',
  componentProps: Recordable<any> = {},
) => {
  return defineComponent({
    name: component.name,
    inheritAttrs: false,
    setup: (props: any, { attrs, expose, slots }) => {
      const placeholder =
        props?.placeholder ||
        attrs?.placeholder ||
        $t(`ui.placeholder.${type}`);
      // 透传组件暴露的方法
      const innerRef = ref();
      expose(
        new Proxy(
          {},
          {
            get: (_target, key) => innerRef.value?.[key],
            has: (_target, key) => key in (innerRef.value || {}),
          },
        ),
      );
      return () =>
        h(
          component,
          { ...componentProps, placeholder, ...props, ...attrs, ref: innerRef },
          slots,
        );
    },
  });
};

// 这里需要自行根据业务组件库进行适配，需要用到的组件都需要在这里类型说明
export type ComponentType =
  | 'ApiCascader'
  | 'ApiSelect'
  | 'ApiTreeSelect'
  | 'AutoComplete'
  | 'Cascader'
  | 'Checkbox'
  | 'CollapsibleParams'
  | 'DatePicker'
  | 'Divider'
  | 'IconPicker'
  | 'Input'
  | 'InputNumber'
  | 'InputPassword'
  | 'InputSearch'
  | 'RadioGroup'
  | 'RangePicker'
  | 'Select'
  | 'Switch'
  | 'Textarea'
  | 'TimePicker'
  | 'TreeSelect'
  | BaseFormComponentType;

/**
 * 与 {@link ComponentType} 中注册的组件名一一对应，便于 Schema 上 `component` + `componentProps` 联动提示。
 */
export interface ComponentPropsMap {
  ApiCascader: ApiComponentSharedProps & Recordable<any>;
  ApiSelect: ApiComponentSharedProps & Recordable<any>;
  ApiTreeSelect: ApiComponentSharedProps & Recordable<any>;
  AutoComplete: Recordable<any>;
  Cascader: Recordable<any>;
  Checkbox: Recordable<any>;
  CollapsibleParams: CollapsibleParamsProps;
  DatePicker: Recordable<any>;
  Divider: Recordable<any>;
  IconPicker: IconPickerProps;
  Input: Recordable<any>;
  InputNumber: Recordable<any>;
  InputPassword: Recordable<any>;
  InputSearch: Recordable<any>;
  RadioGroup: Recordable<any>;
  RangePicker: Recordable<any>;
  Select: Recordable<any>;
  Switch: Recordable<any>;
  Textarea: Recordable<any>;
  TimePicker: Recordable<any>;
  TreeSelect: Recordable<any>;
}

async function initComponentAdapter() {
  const components: Partial<Record<ComponentType, Component>> = {
    ApiCascader: withDefaultPlaceholder(ApiComponent, 'select', {
      component: TreeSelectField,
      optionsPropName: 'treeData',
    }),
    ApiSelect: withDefaultPlaceholder(ApiComponent, 'select', {
      component: SelectField,
    }),
    ApiTreeSelect: withDefaultPlaceholder(ApiComponent, 'select', {
      component: TreeSelectField,
      optionsPropName: 'treeData',
    }),
    AutoComplete: withDefaultPlaceholder(Input, 'input'),
    Cascader: withDefaultPlaceholder(TreeSelectField, 'select'),
    Checkbox,
    CollapsibleParams: VbenCollapsibleParams,
    DatePicker: withDefaultPlaceholder(DatePickerField, 'input'),
    Divider: DividerField,
    IconPicker: withDefaultPlaceholder(IconPicker, 'select'),
    Input: withDefaultPlaceholder(Input, 'input'),
    InputNumber: withDefaultPlaceholder(InputNumberField, 'input'),
    InputPassword: withDefaultPlaceholder(Input, 'input', {
      type: 'password',
    }),
    InputSearch: withDefaultPlaceholder(InputSearch, 'input'),
    RadioGroup: withDefaultPlaceholder(RadioGroupField, 'select'),
    RangePicker: withDefaultPlaceholder(RangePickerField, 'input'),
    Select: withDefaultPlaceholder(SelectField, 'select'),
    Switch,
    Textarea: withDefaultPlaceholder(TextareaField, 'input'),
    TimePicker: withDefaultPlaceholder(Input, 'input', {
      type: 'time',
    }),
    TreeSelect: withDefaultPlaceholder(TreeSelectField, 'select'),
  };

  // 将组件注册到全局共享状态中
  globalShareState.setComponents(components);

  // 定义全局共享状态中的消息提示
  globalShareState.defineMessage({
    // 复制成功消息提示
    copyPreferencesSuccess: (title, content) => {
      toast.success(content ?? '', { description: title });
    },
  });
}

export { initComponentAdapter };
